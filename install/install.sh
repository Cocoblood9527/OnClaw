#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
install_root="${ONCLAW_INSTALL_ROOT:-${repo_root}/onclaw}"
skip_npm="${ONCLAW_INSTALL_SKIP_NPM:-0}"
normalized_root="${install_root%/}"
normalized_root_lower="$(printf "%s" "${normalized_root}" | tr "[:upper:]" "[:lower:]")"

if [[ ! "${normalized_root_lower}" =~ (^|/)onclaw$ ]]; then
  echo "ONCLAW_INSTALL_ROOT must end with /onclaw" >&2
  exit 1
fi

mkdir -p \
  "${normalized_root}/runtime" \
  "${normalized_root}/snapshots" \
  "${normalized_root}/state" \
  "${normalized_root}/data" \
  "${normalized_root}/logs" \
  "${normalized_root}/cache" \
  "${normalized_root}/downloads" \
  "${normalized_root}/tmp"

template_entry="${repo_root}/onclaw/runtime/openclaw-entry.cjs"
if [[ ! -f "${template_entry}" ]]; then
  echo "runtime entry template missing: ${template_entry}" >&2
  exit 1
fi
cp "${template_entry}" "${normalized_root}/runtime/openclaw-entry.cjs"

if [[ "${skip_npm}" != "1" ]]; then
  npm --prefix "${normalized_root}/runtime" install --no-save openclaw@latest
fi

echo "OnClaw installed at ${normalized_root}"
