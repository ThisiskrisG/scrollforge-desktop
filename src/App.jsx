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
  const requestCounter = useRef(0);
  const [output, setOutput] = useState('');
  const [code, setCode] = useState(`# Python example\nprint("hello from pyodide")`);
  const debouncedCode = useDebounced(code, 350);

  // initialize worker
  useEffect(() => {
    // module worker so we can import ESM in worker
    const w = new Worker(new URL('./pyodide-worker.js', import.meta.url), { type: 'module' });
    workerRef.current = w;
    w.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'inited') {
        console.log('pyodide inited');
      } else if (msg.type === 'result') {
        setOutput(msg.result);
      } else if (msg.type === 'error') {
        setOutput(`Error: ${msg.error}`);
      }
    };
    w.postMessage({ id: ++requestCounter.current, type: 'init' });

    return () => {
      w.terminate();
    };
  }, []);

  // run code when debounced value changes
  useEffect(() => {
    if (!workerRef.current) return;
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
    editorRef.current.onDidChangeModelContent(() => {
      setCode(editorRef.current.getValue());
    });
  }

  // preview iframe update via srcdoc
  const iframeRef = useRef(null);
  useEffect(() => {
    const doc = iframeRef.current?.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<pre>${escapeHtml(output)}</pre>`);
    doc.close();
  }, [output]);

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
