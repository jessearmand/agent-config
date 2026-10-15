#!/usr/bin/env bash
# Install the guard extension into omp, pi, or both (default: every host found).
#   ./install.sh            install into each of omp and pi that is on PATH
#   ./install.sh omp|pi     install into one host
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
    echo "error: python3 is required" >&2
    exit 1
fi

hosts=("$@")
if [[ ${#hosts[@]} -eq 0 ]]; then
    for host in omp pi; do
        command -v "$host" >/dev/null 2>&1 && hosts+=("$host")
    done
fi
if [[ ${#hosts[@]} -eq 0 ]]; then
    echo "error: neither omp nor pi is on PATH" >&2
    exit 1
fi

for host in "${hosts[@]}"; do
    case "$host" in
        omp) omp plugin link "$DIR" && echo "Installed into omp (uninstall: omp plugin uninstall omp-guard-hooks)" ;;
        pi) pi install "$DIR" && echo "Installed into pi (uninstall: pi uninstall $DIR)" ;;
        *) echo "error: unknown host '$host' (expected omp or pi)" >&2; exit 1 ;;
    esac
done

cat <<'MSG'
Restart the host to load the extension.

Optional environment variables:
  HOOK_JEV_ENABLE=1
  HOOK_JEV_FNOX_CONFIG=FNOX_CONFIG_PATH
  OMP_GUARD_DISABLE=1
MSG
