#!/usr/bin/env bash
set -euo pipefail

echo "Checking for forbidden Gemma 3 live model references..."

if grep -R "gemma-3-27b-it" -n README.md replit.md artifacts lib docs \
  --exclude-dir=node_modules --exclude-dir=dist; then
  echo "Forbidden hardcoded Gemma 3 model reference found."
  exit 1
fi

if grep -R "Gemma 4" -n README.md replit.md artifacts lib docs \
  --exclude-dir=node_modules --exclude-dir=dist | grep -v "GEMMA_MODEL_ID" >/tmp/gemma4_claims.txt; then
  echo "Gemma 4 claims found. Ensure they are backed by code and metadata."
  cat /tmp/gemma4_claims.txt
fi

echo "Gemma 4 claim check completed."
