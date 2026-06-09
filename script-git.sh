#!/bin/bash
# =============================================
# Auto Git Commit & Push Script (Fixed)
# =============================================

echo "🚀 Starting Git workflow..."

# Go to project root
cd /home/workdir/artifacts

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Error: Not inside a Git repository!"
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "ℹ️  No changes detected."
  exit 0
fi

# Better auto message
CHANGES=$(git diff --cached --name-only | head -3)
if echo "$CHANGES" | grep -qE '\.(js|ts|jsx|tsx|vue)$'; then
  TYPE="feat"
elif echo "$CHANGES" | grep -qE '\.(css|scss|less|tailwind)'; then
  TYPE="style"
elif echo "$CHANGES" | grep -qE '\.(html|json|md)'; then
  TYPE="docs"
else
  TYPE="chore"
fi

AUTO_MSG="$TYPE: update web application"

echo "💾 Committing: $AUTO_MSG"
git commit -m "$AUTO_MSG"

echo "⬆️  Pushing..."
git push && echo "✅ Done!" || echo "❌ Push failed. Check internet / remote."

