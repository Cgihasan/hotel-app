#!/bin/bash
# =============================================
# Auto Git Commit & Push Script
# For your hotel-app project
# =============================================

echo "🚀 Starting Git workflow..."

# Go to your project directory
cd /home/hasan/site/hotel-app || {
  echo "❌ Cannot access /home/hasan/site/hotel-app"
  exit 1
}

# Check git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Not a git repository!"
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "ℹ️  No changes detected."
  exit 0
fi

# Smart commit type detection
CHANGES=$(git diff --cached --name-only | head -5)
if echo "$CHANGES" | grep -qE '\.(js|ts|jsx|tsx|vue)$'; then
  TYPE="feat"
elif echo "$CHANGES" | grep -qE '\.(css|scss|less|tailwind|html)$'; then
  TYPE="style"
elif echo "$CHANGES" | grep -qE '\.(json|md|yml|yaml)$'; then
  TYPE="docs"
else
  TYPE="chore"
fi

AUTO_MSG="$TYPE: update hotel app"

echo "💾 Committing: $AUTO_MSG"
git commit -m "$AUTO_MSG"

echo "⬆️  Pushing to remote..."
git push && echo "✅ Done!" || echo "❌ Push failed. Check your internet or remote repo."
