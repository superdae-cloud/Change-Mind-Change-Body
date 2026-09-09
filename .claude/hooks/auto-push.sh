#!/bin/bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ -z "$(git status --porcelain --untracked-files=all)" ]; then
  exit 0
fi

git add -A
git commit -m "Auto-update from Claude Code session" --quiet

if git push origin HEAD --quiet 2>/tmp/claude-autopush-err.log; then
  echo '{"systemMessage": "Auto-committed and pushed website changes to GitHub."}'
else
  err=$(tail -c 300 /tmp/claude-autopush-err.log | tr '\n' ' ')
  echo "{\"systemMessage\": \"Auto-commit succeeded but push to GitHub failed: ${err}\"}"
fi
