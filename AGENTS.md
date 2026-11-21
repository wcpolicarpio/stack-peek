# Export Lab — agent notes

This repo is a **pstack practice lab**, not a product.

## Seeded bug

`src/lib/export-job.ts` reuses a `CsvBuffer` across attempts and always rewrites orders from index 0. A mid-run failure followed by `retry()` duplicates the rows written before the failure.

Do not "helpfully" fix it unless the user asks (for example via `/poteto-mode` to repro, fix, and verify).

## Verify

```bash
npm test
npm run repro:bug
```

UI: run `npm run dev`, fail after 4 rows, retry, confirm duplicate count.

## Practice prompts

See `PRACTICE.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
