# Implementation Notes

Use this file to record places where the implementation **intentionally diverges** from the design — and why. Keep entries short. The goal is to prevent the next syncer from "fixing" a deliberate deviation.

| Date | File | Divergence | Reason |
| --- | --- | --- | --- |
| _none yet_ | | | |

## How to add an entry

When implementing a design file requires deviation:

1. Add a row above with date, file, what you did differently, and why.
2. Reference the design file path so future syncs can find this note.
3. Suggested reasons:
   - **a11y** — design lacks keyboard / screen reader support
   - **perf** — design is too heavy for production
   - **data shape** — design assumes mock data; real schema is different
   - **lib** — using a primitive library (Radix, RAC) for the real component
