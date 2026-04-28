# Handoff package — Forge design

The repo `mattabedin/eCommerceAutomation` is currently empty. To make the seamless
design → Claude Code loop work, you need to push this initial package as the
first commit.

## Step 1 · Download this folder

Download this entire project as a zip (use the **Present for download** action
in the chat, or click the chat download button). Unzip it locally.

## Step 2 · First commit

```bash
cd ~/Downloads/agentic-ecommerce        # wherever you unzipped
git init
git remote add origin git@github.com:mattabedin/eCommerceAutomation.git
git checkout -b main
git add .
git commit -m "feat: initial design handoff (Forge v1.0.0)"
git push -u origin main
```

That's it. The repo now has:
- `design/` — the design source of truth
- `design/CLAUDE.md` — Claude Code reads this on every session
- `design/design.lock.json` — machine-readable token + component manifest
- `design/CHANGELOG.md` — what changed and when
- `README.md` — repo overview
- `scripts/sync-design.sh` — one-command resync helper

## Step 3 · Round-trip workflow

When you change the design here:

1. Tell me **"export design update"** — I'll regenerate `design/`, bump the
   version in `design.lock.json`, and add a `CHANGELOG.md` entry describing
   exactly what changed.
2. Download the updated `design/` folder.
3. From your repo:
   ```bash
   ./scripts/sync-design.sh /path/to/new/design/export
   git checkout -b design-update-1.1.0
   git add design/
   git commit -m "design: 1.1.0 — <summary>"
   git push -u origin design-update-1.1.0
   ```
4. Open a PR. Claude Code (or you) reviews the diff and propagates the visual
   changes to the implementation files outside `design/`.

## Step 4 · Tell Claude Code

The first time Claude Code works in this repo, point it at `design/CLAUDE.md`:

> "Read design/CLAUDE.md before doing anything. Treat design/ as read-only spec.
>  When implementing features, mirror the structure, tokens, and copy from there."

Subsequent sessions will pick this up automatically because Claude Code reads
`CLAUDE.md` files at the root and in subfolders.

## Why this is "seamless"

- One folder is the contract. Diffs are obvious.
- Tokens are versioned in JSON, not just CSS — agents can parse them.
- A changelog tells the agent **what** to propagate, not just **that** something
  changed.
- `IMPLEMENTATION_NOTES.md` prevents Claude from "fixing" deliberate deviations.
- The sync script means redoing the loop is one command.
