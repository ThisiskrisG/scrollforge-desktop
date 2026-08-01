import React, { useEffect, useRef, useState } from 'react';
import { loadMonaco } from './monaco-loader';

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function App() {
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef(null);
  const editorElRef = useRef(null);
  const workerRef = useRef(null);
  const [workerReady, setWorkerReady] = useState(false);
  const pendingRunRef = useRef(null);
  const requestCounter = useRef(0);
  const [output, setOutput] = useState('');
  const [code, setCode] = useState(`# Python example\nprint("hello from pyodide")`);
  const debouncedCode = useDebounced(code, 350);

  // lazy initialize worker and queue first run if necessary
  async function initWorker() {
    if (workerRef.current) return;
    const w = new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' });
    workerRef.current = w;
    w.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'inited') {
        console.log('pyodide inited');
        setWorkerReady(true);
        // if there is a pending code run, send it now
        if (pendingRunRef.current != null) {
          w.postMessage({ id: ++requestCounter.current, type: 'run', code: pendingRunRef.current });
          pendingRunRef.current = null;
        }
      } else if (msg.type === 'result') {
        setOutput(msg.result);
      } else if (msg.type === 'error') {
        setOutput(`Error: ${msg.error}`);
      }
    };
    // start initialization in worker
    w.postMessage({ id: ++requestCounter.current, type: 'init' });
  }

  // run code when debounced value changes
  useEffect(() => {
    if (!debouncedCode) return;
    // if worker doesn't exist yet, create it and queue the latest code
    if (!workerRef.current) {
      pendingRunRef.current = debouncedCode;
      initWorker();
      return;
    }
    // worker exists but may not be fully ready (inited)
    if (!workerReady) {
      pendingRunRef.current = debouncedCode;
      return;
    }
    // worker ready: send run
    workerRef.current.postMessage({ id: ++requestCounter.current, type: 'run', code: debouncedCode });
  }, [debouncedCode]);

  // lazy load monaco when editor area is focused/visible
  async function ensureMonaco() {
    if (monacoLoaded) return;
    const monaco = await loadMonaco();
    setMonacoLoaded(true);
    // create editor
    editorRef.current = monaco.editor.create(editorElRef.current, {
      value: code,
      language: 'python',
      minimap: { enabled: false },
      automaticLayout: true
    });
    // keep disposable so we can dispose on unmount
    editorRef.current._changeDisposable = editorRef.current.onDidChangeModelContent(() => {
      setCode(editorRef.current.getValue());
    });
  }

  // preview iframe update via srcdoc
  const iframeRef = useRef(null);
  useEffect(() => {
    if (!iframeRef.current) return;
    // use srcdoc to update iframe content — avoids document.write and is clearer
    iframeRef.current.srcdoc = `<pre>${escapeHtml(output)}</pre>`;
  }, [output]);

  // cleanup worker + editor on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setWorkerReady(false);
      }
      if (editorRef.current) {
        // dispose content-change listener if we attached it
        if (editorRef.current._changeDisposable) {
          editorRef.current._changeDisposable.dispose();
        }
        try { editorRef.current.dispose(); } catch (e) {}
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '50%', borderRight: '1px solid #ddd', padding: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => ensureMonaco()}>Open Editor (lazy load)</button>
        </div>
        <div ref={editorElRef} style={{ height: '80vh', border: '1px solid #ccc' }}>
          {!monacoLoaded && <div style={{ padding: 16 }}>Editor not loaded — click “Open Editor”</div>}
        </div>
      </div>

      <div style={{ width: '50%', padding: 8 }}>
        <h3>Output (Pyodide)</h3>
        <iframe title="preview" ref={iframeRef} style={{ width: '100%', height: '80vh' }} />
      </div>
    </div>
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
