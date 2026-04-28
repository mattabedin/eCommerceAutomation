# Implementation Notes

Use this file to record places where the implementation **intentionally diverges** from the design — and why. Keep entries short. The goal is to prevent the next syncer from "fixing" a deliberate deviation.

| Date | File | Divergence | Reason |
| --- | --- | --- | --- |
| 2026-04-28 | `design.lock.json` `routes` | Section labels in implementation follow `design/shell.jsx` (Build / Manage / Grow / Workspace), not the lock's `Build / Run / Account`. shell.jsx is the actual UI definition; the lock's section field is descriptive metadata. | data shape |
| 2026-04-28 | `design/styles.css` `:root` | Tokens are auto-generated into `apps/web/src/styles/tokens.css` by `scripts/build-tokens.mjs` reading `design/design.lock.json`. The remainder of `styles.css` is ported verbatim into `apps/web/src/app/globals.css`. The lock drives the live theme — when it changes, run `pnpm tokens` to regenerate. | data shape |

## How to add an entry

When implementing a design file requires deviation:

1. Add a row above with date, file, what you did differently, and why.
2. Reference the design file path so future syncs can find this note.
3. Suggested reasons:
   - **a11y** — design lacks keyboard / screen reader support
   - **perf** — design is too heavy for production
   - **data shape** — design assumes mock data; real schema is different
   - **lib** — using a primitive library (Radix, RAC) for the real component
