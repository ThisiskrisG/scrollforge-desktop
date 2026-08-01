// Runs as a module worker: new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' })
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.mjs';

let pyodide = null;
let initialized = false;
let lastRunId = 0;

// Limit how much output we send back to the main thread
const MAX_OUTPUT_LENGTH = 200_000; // characters
const RUN_TIMEOUT_MS = 20_000; // worker-level timeout guard (note: cannot forcibly cancel pyodide run)

self.addEventListener('message', async (ev) => {
  const msg = ev.data;
  try {
    if (msg.type === 'init') {
      if (!initialized) {
        pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/'
        });
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
