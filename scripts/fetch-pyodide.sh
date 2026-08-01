#!/usr/bin/env bash
# Helper script to download a local copy of Pyodide into public/pyodide/
# Usage: ./scripts/fetch-pyodide.sh
# NOTE: This mirrors the CDN directory for the specified Pyodide version into public/pyodide.

set -euo pipefail
PYODIDE_VERSION="v0.23.3"
DEST_DIR="public/pyodide"
BASE_URL="https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/"

echo "Creating ${DEST_DIR}..."
mkdir -p "${DEST_DIR}"

# Try to use wget to mirror the directory. If wget is not available, instruct the user.
if command -v wget >/dev/null 2>&1; then
  echo "Downloading Pyodide ${PYODIDE_VERSION} to ${DEST_DIR} (this may be large)..."
  # --no-parent prevents traversal above the given directory
  # --recursive and --level=1 should grab files in the directory
  wget --mirror --no-parent --no-host-directories --cut-dirs=3 -P public "${BASE_URL}"
  echo "Download complete. Verify public/pyodide contains pyodide.mjs and related files."
else
  echo "Error: wget not found. Please install wget or manually download the Pyodide full build into ${DEST_DIR} from ${BASE_URL}" >&2
  exit 2
fi
