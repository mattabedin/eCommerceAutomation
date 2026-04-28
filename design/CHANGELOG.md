# Design Changelog

All notable changes to the Forge design source. The most recent change is on top.
Each entry: version, date, author, and a list of impacted files + summary.

## [1.0.0] — 2026-04-27

**Initial design handoff to engineering.**

### Added
- Admin app shell (`Forge.html`, `shell.jsx`) with sidebar + workspace switcher
- AI Builder chat experience (`builder.jsx`)
- Live storefront preview (`preview.jsx`)
- Admin views: Dashboard, Products, Orders, Customers, Marketing, Support, Analytics, Settings, Billing (`views.jsx`)
- **Publishing & Hosting** module (`publishing.jsx`)
  - Publishing tab: editable subdomain, deploy progress, deployment timeline, plan limits
  - Domain tab: add → DNS records → verify → connected flow with stepper
  - Storage tab: asset gallery, usage donut, upload dropzone, AI-generated tag
  - Super-admin tab: all-stores table, failed events feed, storage by plan
- Marketing site: `landing.html`, `pricing.html`, `about.html`
- Tweaks panel for live design exploration (`tweaks-panel.jsx`)
- Mock data for two brands: PawLuxe (premium pet) and DeskNova (workspace)

### Tokens
- Indigo-based light theme (`--accent: #6366F1`)
- Dark mode via `[data-theme="dark"]`
- Inter / JetBrains Mono / Instrument Serif type stack

---

## How to read this file

When you (Claude Code or human) sync from `design/`, find the highest version line, then walk backwards until you reach the version you last consumed. Apply each entry's changes to the implementation in order.

If a version is marked **BREAKING**, expect token renames or component API changes — read carefully.
