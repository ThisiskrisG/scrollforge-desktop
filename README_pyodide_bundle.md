Bundling Pyodide into the Electron app

This project can run Pyodide from the network (CDN) or from a local copy included in the app. Shipping a local copy removes the network dependency and speeds cold starts for desktop/Electron builds.

How it works (what I implemented)
- The worker (src/pyodide-worker.js) will try to import a local /pyodide/pyodide.mjs file first. If that import fails (local files not present), it falls back to loading Pyodide from the CDN (unchanged behavior).
- When a local copy is used, the worker calls loadPyodide({ indexURL: '/pyodide/' }) so the runtime loads its supporting files from the same local directory.

How to bundle Pyodide for development
1. Run the helper script to mirror the Pyodide CDN into public/pyodide (this will make the assets available at /pyodide/ during dev and will be copied into the production build):

   ./scripts/fetch-pyodide.sh

   Note: this uses wget to mirror the CDN directory. The directory can be large (tens of MB). If your environment lacks wget, download the files manually from https://cdn.jsdelivr.net/pyodide/v0.23.3/full/ into public/pyodide/.

2. Start the dev server as usual (Vite serves public/ statically):

   npm run dev

3. Start the Electron shell; since the worker imports /pyodide/pyodide.mjs, Electron will load the local files instead of fetching them.

Packaging for production (Electron)
- Ensure your build process copies public/pyodide into the packaged app's resources (most Electron packagers include the public/ files by default). After packaging, the worker will import from the app's served root (file:// or packaged server) and use the local Pyodide copy.
- If you encounter path issues in a packaged app (file:// vs /), you can adjust the worker's resolveLoadPyodide() to detect running in Electron (e.g., inspect location.protocol or self.origin) and compute a suitable file URL.

Notes and caveats
- The Pyodide full build is large. Including it in the app increases installer size.
- The helper script attempts to mirror the CDN directory but may not capture every file in some environments. Verify that at minimum public/pyodide contains pyodide.mjs and the accompanying WASM files.
- I kept the CDN fallback to preserve the previous behavior when local files are not present.

If you'd like, I can:
- Add an npm script (e.g., "fetch-pyodide") that runs the helper script.
- Update the Electron packaging scripts to guarantee public/pyodide is included in builds (I can modify package.json and electron-builder / electron-packager configs if you tell me which packager you use).
