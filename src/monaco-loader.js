// Minimal Monaco loader for Vite. Returns the global monaco object.
export async function loadMonaco() {
  // dynamic import to keep editor out of initial bundle
  const monaco = await import('monaco-editor/esm/vs/editor/editor.api.js');
  return monaco;
}
