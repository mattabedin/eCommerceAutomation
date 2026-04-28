# Forge — AI Store Builder

A SaaS platform that lets non-technical users describe a store in plain English and get a live, sellable, AI-managed e-commerce site.

## Repo layout

```
.
├── design/             ← Design source of truth (synced from design tool)
│   ├── CLAUDE.md       ← Read this first — golden rules for editing
│   ├── design.lock.json← Tokens + component inventory (machine-readable)
│   ├── CHANGELOG.md    ← What changed in each design version
│   ├── IMPLEMENTATION_NOTES.md ← Deliberate impl divergences
│   ├── *.html / *.css / *.jsx  ← The actual design files
│   └── ...
└── (your implementation lives here — apps/, packages/, etc.)
```

## Working with the design

The `design/` folder is the **single source of truth** for visual + UX design. It's maintained in a separate design tool by the design team and synced to this repo on every change.

### When pulling design updates

```bash
git pull
git diff HEAD~1 -- design/
cat design/CHANGELOG.md
```

Then propagate the visual changes to the implementation. See `design/CLAUDE.md` § "Update protocol" for the full process.

### When implementing a feature

1. Open the matching file in `design/` (e.g. `design/publishing.jsx` for the Publishing module).
2. Read `design/CLAUDE.md` for tokens, conventions, component inventory.
3. Mirror the structure, copy, and visual language. **Don't reinvent.**
4. If you must deviate, log it in `design/IMPLEMENTATION_NOTES.md`.

### Previewing the design locally

The design files are static — open `design/Forge.html` in a browser. The Tweaks panel (top-right) lets you switch views and brands.

```bash
cd design
python3 -m http.server 8000
# open http://localhost:8000/Forge.html
```

## Why this setup

- **Design and code stay in sync.** Diff-based reviews catch drift.
- **Engineers never guess.** Tokens, component names, copy, and structure are all explicit.
- **AI agents (Claude Code) work better.** With `CLAUDE.md` and `design.lock.json`, an agent can autonomously propagate design changes.
