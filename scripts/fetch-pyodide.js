#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PYODIDE_VERSION = 'v0.23.3';
const BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const DEST_DIR = path.join(__dirname, '..', 'public', 'pyodide');

function ensureDir() {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

function hasCommand(cmd) {
  try {
    const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
    return res.status === 0;
  } catch (e) {
    return false;
  }
}

function runWget() {
  console.log('Using wget to mirror the pyodide directory (this may be large)...');
  const args = ['--mirror', '--no-parent', '--no-host-directories', '--cut-dirs=3', '-P', 'public', BASE_URL];
  const res = spawnSync('wget', args, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error('wget failed');
  }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function fallbackDownload() {
  console.log('wget not found. Falling back to direct downloads of a small set of core files.');
  console.log('This may not include all auxiliary Pyodide files; consider installing wget or using the wget method.');
  // Include pyodide.wasm in the fallback list; some Pyodide releases provide a standalone .wasm file instead of asm.wasm/data pairs.
  const files = ['pyodide.mjs', 'pyodide.wasm', 'pyodide.asm.wasm', 'pyodide.wasm.data', 'packages.json'];
  for (const f of files) {
    const url = BASE_URL + f;
    const dest = path.join(DEST_DIR, f);
    try {
      console.log(`Downloading ${url} -> ${dest}`);
      await downloadFile(url, dest);
    } catch (err) {
      console.warn(`Failed to download ${url}: ${err.message}`);
    }
  }
  console.log('Fallback download finished. Verify public/pyodide contains the necessary files (pyodide.mjs and wasm/data files).');
}

(async () => {
  try {
    ensureDir();
    if (hasCommand('wget')) {
      runWget();
    } else if (hasCommand('curl') && process.platform === 'win32') {
      // On Windows, curl is often available. Try a partial approach using curl for the main file(s).
      await fallbackDownload();
    } else {
      await fallbackDownload();
    }
    console.log('Done.');
  } catch (err) {
    console.error('Failed to fetch pyodide:', err);
    process.exit(2);
  }
})();
