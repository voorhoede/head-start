#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing project dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci
else
  echo "Error: package-lock.json is required for deterministic devcontainer setup." >&2
  echo "Please commit package-lock.json and rebuild the container." >&2
  exit 1
fi

echo "==> Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

echo "==> Setup complete."
echo ""
echo "Run 'claude' to start Claude Code."
echo "Copilot will prompt you to sign in on first use."