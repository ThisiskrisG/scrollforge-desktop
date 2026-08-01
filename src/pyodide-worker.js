// Runs as a module worker: new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' })
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.mjs';

let pyodide = null;
let initialized = false;

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
      // run Python asynchronously and return the result (stringified)
      try {
        const result = await pyodide.runPythonAsync(msg.code);
        self.postMessage({ id: msg.id, type: 'result', result: String(result) });
      } catch (err) {
        self.postMessage({ id: msg.id, type: 'error', error: String(err) });
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
