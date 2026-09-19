#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
    echo "error: python3 is required" >&2
    exit 1
fi

omp plugin link "$DIR"

cat <<'EOF'
Installed omp-guard-hooks. Restart omp to load the extension.

Optional environment variables:
  HOOK_JEV_ENABLE=1
  HOOK_JEV_FNOX_CONFIG=FNOX_CONFIG_PATH
  OMP_GUARD_DISABLE=1

Uninstall with: omp plugin uninstall omp-guard-hooks
EOF
