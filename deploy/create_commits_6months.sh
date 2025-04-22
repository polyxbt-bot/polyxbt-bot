#!/bin/bash
# Usage: run from the repo root. This script will create daily commits spanning the last 180 days
# It will set the author to "PolyXBT Dev <polyxbt@example.com>" and create trivial commits to populate contribution graph.
# IMPORTANT: Run on a clean repo. This script rewrites history as new commits; do NOT run if repo already has important history.

AUTHOR_NAME="PolyXBT Dev"
AUTHOR_EMAIL="polyxbt@example.com"

days=180
start_date=$(date -d "-$days days" +%Y-%m-%d)

for i in $(seq 0 $days); do
  d=$(date -d "$start_date +$i days" +%Y-%m-%d)
  # touch a small file to commit (changes only if content differs)
  echo "$d" > .commit_note.txt
  GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" GIT_AUTHOR_DATE="$d 12:00:00" \
    GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" GIT_COMMITTER_DATE="$d 12:00:00" \
    git add .commit_note.txt && git commit -m "chore: progress on $d" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" || true
done

echo "Created daily commits from $start_date to today."
echo "Now push with: git remote add origin <your-github-repo-url>"
echo "Then: git push -u origin main --force"
