#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing project dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci
else
  echo "No package-lock.json found, running npm install..."
  npm install
fi

echo "==> Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

echo "==> Setup complete."
echo ""
echo "Run 'claude' to start Claude Code."
echo "Copilot will prompt you to sign in on first use."