// Runs as a module worker: new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' })
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.mjs';

let pyodide = null;
let initialized = false;
let lastRunId = 0;

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
        const result = await pyodide.runPythonAsync(msg.code);
        // only post result if this run is still the latest requested run
        if (runId === lastRunId) {
          self.postMessage({ id: msg.id, type: 'result', result: String(result) });
        } else {
          // otherwise, ignore stale result
          // (main thread may have requested a newer run which will produce its own result)
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
