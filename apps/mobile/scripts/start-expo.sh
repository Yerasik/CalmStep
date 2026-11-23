#!/usr/bin/env bash
# Ubuntu ships Node 12. Expo SDK 58 needs Node 20+.
set -euo pipefail
NODE_HOME="${HOME}/.local/node"
if [[ ! -x "${NODE_HOME}/bin/node" ]]; then
  echo "CalmStep needs Node 20+. Expected ${NODE_HOME}/bin/node" >&2
  exit 1
fi
# Prefer this Node's npm. Ubuntu /usr/bin/npm breaks with "Cannot find module 'semver'".
export PATH="${NODE_HOME}/bin:${PATH}"
NODE="${NODE_HOME}/bin/node"
echo "Using ${NODE} ($("${NODE}" -v))"
cd "$(dirname "$0")/.."
"${NODE}" ./scripts/patch-reanimated.js
exec "${NODE}" ./node_modules/expo/bin/cli start --port 8082 "$@"
