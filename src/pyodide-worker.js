// Runs as a module worker: new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' })
// This worker can load Pyodide either from a locally-cached copy served at /pyodide/
// (recommended for an Electron packaged app) or fall back to the CDN.

let pyodide = null;
let initialized = false;
let lastRunId = 0;

// Limit how much output we send back to the main thread
const MAX_OUTPUT_LENGTH = 200_000; // characters
const RUN_TIMEOUT_MS = 20_000; // worker-level timeout guard (note: cannot forcibly cancel pyodide run)

async function tryImport(url) {
  try {
    const m = await import(url);
    if (m && typeof m.loadPyodide === 'function') {
      return m;
    }
  } catch (err) {
    // ignore and return null so caller can try other options
  }
  return null;
}

async function resolveLoadPyodide() {
  // 1) Try absolute local path first (served at /pyodide/ when running in dev or a static server)
  try {
    const m = await tryImport('/pyodide/pyodide.mjs');
    if (m) {
      return { loadPyodide: m.loadPyodide, indexURL: '/pyodide/' };
    }
  } catch (err) {
    // continue to other strategies
  }

  // 2) If running from file:// (packaged Electron), try resolving pyodide relative to this worker script
  //    using a few likely relative locations. import.meta.url points to the worker script location.
  try {
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
      const candidates = [
        // relative to where the worker script is placed inside the app bundle
        new URL('../public/pyodide/pyodide.mjs', import.meta.url).href,
        new URL('../../public/pyodide/pyodide.mjs', import.meta.url).href,
        new URL('./pyodide/pyodide.mjs', import.meta.url).href,
        new URL('pyodide/pyodide.mjs', import.meta.url).href
      ];
      for (const c of candidates) {
        const m = await tryImport(c).catch(() => null);
        if (m) {
          // compute indexURL as the directory containing pyodide.mjs
          const idx = c.replace(/pyodide\.mjs(.*)?$/, '');
          return { loadPyodide: m.loadPyodide, indexURL: idx };
        }
      }
    }
  } catch (err) {
    // ignore and fall back to CDN
  }

  // 3) Fallback to CDN
  const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.mjs';
  const m = await import(CDN);
  return { loadPyodide: m.loadPyodide, indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/' };
}

self.addEventListener('message', async (ev) => {
  const msg = ev.data;
  try {
    if (msg.type === 'init') {
      if (!initialized) {
        const loader = await resolveLoadPyodide();
        pyodide = await loader.loadPyodide({ indexURL: loader.indexURL });
        // Example: mount OPFS or pre-load small packages if desired
        initialized = true;
      }
      self.postMessage({ id: msg.id, type: 'inited' });
    } else if (msg.type === 'run') {
      if (!initialized) {
        self.postMessage({ id: msg.id, type: 'error', error: 'Pyodide not initialized' });
        return;
      }
      // Track the latest run id so we can ignore stale/long-running results.
      lastRunId = msg.id;
      const runId = msg.id;
      try {
        // We can't truly cancel pyodide.runPythonAsync() from JS, but we wrap with a timeout
        // so we can respond to the UI quickly if a run is taking too long.
        const result = await Promise.race([
          pyodide.runPythonAsync(msg.code),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), RUN_TIMEOUT_MS))
        ]);

        // only post result if this run is still the latest requested run
        if (runId === lastRunId) {
          let out = String(result);
          if (out.length > MAX_OUTPUT_LENGTH) {
            out = out.slice(0, MAX_OUTPUT_LENGTH) + '\n\n[output truncated]';
          }
          self.postMessage({ id: msg.id, type: 'result', result: out });
        } else {
          // otherwise, ignore stale result
        }
      } catch (err) {
        if (runId === lastRunId) {
          self.postMessage({ id: msg.id, type: 'error', error: String(err) });
        } else {
          // stale error — ignore
        }
      }
    } else if (msg.type === 'install') {
      // micropip install example (async)
      if (!initialized) {
        self.postMessage({ id: msg.id, type: 'error', error: 'Pyodide not initialized' });
        return;
      }
      try {
        await pyodide.loadPackage('micropip');
        await pyodide.runPythonAsync(`import micropip\nawait micropip.install("${msg.packageName}")`);
        self.postMessage({ id: msg.id, type: 'installed', packageName: msg.packageName });
      } catch (err) {
        self.postMessage({ id: msg.id, type: 'error', error: String(err) });
      }
    }
  } catch (err) {
    self.postMessage({ id: msg?.id, type: 'error', error: String(err) });
  }
});
