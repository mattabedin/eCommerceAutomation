#!/usr/bin/env bash
# sync-design.sh — push design updates to this repo from the design tool export
# Usage: ./sync-design.sh /path/to/exported/design/folder

set -e

if [ -z "$1" ]; then
  echo "Usage: ./sync-design.sh <path-to-design-export>"
  echo ""
  echo "Example:"
  echo "  ./sync-design.sh ~/Downloads/forge-design-export"
  exit 1
fi

SRC="$1"
DEST="design"

if [ ! -d "$SRC" ]; then
  echo "Error: $SRC does not exist"
  exit 1
fi

# Preserve curated files we own in the repo, not the design tool
KEEP=("CLAUDE.md" "IMPLEMENTATION_NOTES.md")

echo "→ Backing up curated files…"
mkdir -p .design-backup
for f in "${KEEP[@]}"; do
  if [ -f "$DEST/$f" ]; then
    cp "$DEST/$f" ".design-backup/$f"
  fi
done

echo "→ Syncing $SRC → $DEST/"
rsync -a --delete "$SRC/" "$DEST/"

echo "→ Restoring curated files…"
for f in "${KEEP[@]}"; do
  if [ -f ".design-backup/$f" ]; then
    cp ".design-backup/$f" "$DEST/$f"
  fi
done
rm -rf .design-backup

echo "→ Showing diff…"
git --no-pager diff --stat -- "$DEST/"

echo ""
echo "✓ Sync complete. Review the diff above."
echo "  To commit:"
echo "    git add design/"
echo "    git commit -m 'design: <describe changes>'"
echo "    git push"
