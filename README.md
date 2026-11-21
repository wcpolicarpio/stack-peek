# Export Lab

A small Next.js sample app for practicing [Cursor pstack](https://github.com/cursor/plugins/tree/main/pstack).

It ships a deliberate bug: when an order CSV export fails mid-run and is retried, the engine reuses the same buffer and rewrites every order from the start, producing duplicate rows.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default port **3847**).

## Prove the bug

```bash
npm run repro:bug
npm test
```

`repro:bug` fails a job after 4 rows, retries, and prints row counts. The retry case in `npm test` currently fails until you fix the engine.

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
