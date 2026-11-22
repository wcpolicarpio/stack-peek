# Export Lab

A small Next.js sample app for practicing [Cursor pstack](https://github.com/cursor/plugins/tree/main/pstack).

It models order CSV exports that can fail mid-run and retry. The engine clears the buffer on each attempt so retries do not duplicate rows — the regression test in `src/lib/export-job.test.ts` keeps that true.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default port **3847**).

## Verify retry behavior

```bash
npm run repro:bug
npm test
```

`repro:bug` fails a job after 4 rows, retries, and prints row counts. Both should show 12 unique rows and 0 duplicates.

## Practice with pstack

See [PRACTICE.md](./PRACTICE.md) for copy-paste `/poteto-mode` prompts.

Quick start:

```text
/add-plugin pstack
/setup-pstack
```

Then in a new chat:

```text
/poteto-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

## Project map

| Path | Role |
|---|---|
| `src/lib/export-job.ts` | Export engine with the seeded retry bug |
| `src/lib/csv.ts` | CSV buffer helpers |
| `src/lib/orders.ts` | Fixed 12-order fixture |
| `src/lib/export-job.test.ts` | Vitest cases (clean run + retry) |
| `src/app/api/exports/*` | Create / retry / download APIs |
| `src/components/export-lab.tsx` | UI to repro and inspect CSV output |
| `PRACTICE.md` | pstack exercises |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3847 |
| `npm test` | Unit tests |
| `npm run repro:bug` | CLI repro of fail → retry duplicates |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
