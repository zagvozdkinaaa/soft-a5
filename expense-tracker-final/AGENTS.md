# AGENTS.md

## Purpose & Architecture

- **Purpose:** Small, client-side Expense Tracker built with TypeScript, React, Vite, and Vitest.
- **Architecture:**
  - `src/domain/expenses.ts` — pure domain logic (types, validation, creation, filtering, summary calculation). Must stay framework-agnostic (no React or `localStorage` imports).
  - `src/storage/expenseStorage.ts` — `localStorage` persistence with schema validation and safe fallback.
  - `src/App.tsx` & `src/main.tsx` — React UI layer and state wiring.
  - `src/domain/expenses.test.ts` — Vitest unit test suite.

## Setup & Safe Commands

- Install dependencies (only when needed): `npm install`
- Run unit tests: `npm test` (`vitest run`)
- Run typecheck: `npm run lint` (`tsc --noEmit`)
- Run production build: `npm run build` (`vite build`)
- Inspect dependency vulnerabilities (read-only): `npm audit`

## Coding Conventions & Test Expectations

- Keep domain functions in `src/domain/` pure, deterministic, and strictly typed (no `any`).
- Any bug fix or behavior change in `src/domain/` or `src/storage/` must include corresponding unit tests in `src/domain/expenses.test.ts`.
- Before finishing any task, run `npm test`, `npm run lint`, and `npm run build`, and verify all acceptance criteria still pass.
- Preserve existing storage key `"expense-tracker.expenses"` unless a migration is explicitly approved.

## Forbidden Actions

- **No secrets or PII:** Never create, read, log, or commit `.env` files, API keys, tokens, or real personal data.
- **No production deployments:** Never run publish, deploy, or external network upload commands.
- **No destructive commands:** Never run `rm -rf`, `git reset --hard`, `git push --force`, or overwrite git history/tags (`baseline-v0`).
- **No unreviewed dependency changes:** Do not add, remove, or upgrade packages in `package.json` or `package-lock.json` without explicit human review and approval.
