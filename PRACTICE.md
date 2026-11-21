# pstack practice prompts

Install [pstack](https://github.com/cursor/plugins/tree/main/pstack) first:

```text
/add-plugin pstack
/setup-pstack
```

Then open a new chat in this repo and try the prompts below. Prefer picking `/poteto-mode` from the `/` menu (Option/Alt+Enter to pin it as a Custom Mode).

## 1. Bug fix (start here)

The export engine duplicates rows when a mid-run failure is retried. Repro is already wired: fail after 4 rows, then retry.

```text
/poteto-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

Done means:

- `npm test` passes (including the retry case)
- UI retry shows `duplicates 0` and written rows = 12
- You can explain the root cause in one sentence

## 2. Investigation (read-only)

```text
/poteto-mode new task. how does a mid-run export failure and retry work in this lab? don't change any code yet.
```

Or directly:

```text
/how does ExportEngine reuse the CSV buffer across attempts?
```

```text
/why does retry rewrite from index 0?
```

## 3. Feature

JSON export is not implemented. Only CSV exists.

```text
/poteto-mode add a JSON export option beside CSV. CSV output stays byte-identical for existing jobs. verify both formats against the 12 fixture orders.
```

## 4. TDD on the known bug

```text
/poteto-mode repro the duplicate write first. if there's a cheap test path, /tdd it. then fix and rerun.
```

## 5. Skeptical review (after your fix)

```text
/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's an actual bug or regression in behavior.
```

## 6. Catch-up / overnight variants

```text
/poteto-mode im stepping away. keep going until npm test is green and the UI retry path shows zero duplicates. log your decisions.
```

```text
/ketchup
```

## Verify without the UI

```bash
npm test
npm run repro:bug
```

`repro:bug` prints before/after row counts for a fail-then-retry sequence.
