# Export Lab — agent notes

This repo is a **pstack practice lab**, not a product.

## Retry behavior

`ExportEngine.run` clears the `CsvBuffer` at the start of each attempt so a mid-run failure followed by `retry()` does not duplicate rows. The failing-then-passing test in `src/lib/export-job.test.ts` locks that in.

## Verify

```bash
npm test
npm run repro:bug
```

UI: run `npm run dev`, fail after 4 rows, retry — written rows should equal 12 with 0 duplicates.

## Practice prompts

See `PRACTICE.md` for other pstack exercises (investigation, feature, review).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
