# Lana Control Center Real-Operations Upgrade Plan

> **For Hermes:** Execute in numbered phases and report to Fernando when each phase is complete.

**Goal:** Turn the Lana Control Center from a cinematic mockup into a working operator console Fernando can use to know what to do next, track real completion, and manage live Lana operations.

**Architecture:** Keep the app local-first and operator-centric. Use the Zustand store as the source of truth, derive progress and next actions from live task/opportunity/follow-up state, and make the UI editable so Fernando can run Lana from the dashboard instead of treating it like a static presentation.

**Tech Stack:** Next.js app router, React client components, TypeScript, Zustand persistence, derived selectors.

---

## Phase 1 — Real operating model
- Define richer operational data in `lib/types.ts`
- Add derived selectors in `lib/selectors.ts` for:
  - true progress
  - next actionable task
  - readiness/dependency checks
  - queue prioritization
- Save this plan so the implementation has a stable execution path

**Done when:** progress is derived from state and the codebase has explicit structures for real operator work.

## Phase 2 — Editable roadmap and real completion
- Expand `lib/store.ts` with CRUD for tasks and blockers
- Upgrade `app/roadmap/page.tsx` so Fernando can:
  - add tasks
  - update task metadata
  - remove tasks
  - add/remove blockers
- Keep phase completion derived from actual task states, not manual percentages

**Done when:** the roadmap becomes the true source of execution truth.

## Phase 3 — Smart action queue
- Improve `lib/selectors.ts` to rank work using:
  - blockers
  - in-progress work
  - dependencies
  - due dates
  - priority
  - opportunity urgency
  - heartbeat follow-up urgency
- Upgrade `app/page.tsx` to surface the real operator queue and explain why an item is next

**Done when:** Fernando can open the command deck and immediately know the next best move.

## Phase 4 — Live opportunities and heartbeat operations
- Expand `lib/store.ts` with CRUD for opportunities and heartbeat follow-up actions
- Upgrade `app/opportunities/page.tsx` to edit/add/remove opportunities
- Upgrade `app/heartbeats/page.tsx` to track heartbeat follow-up completion status
- Ensure these live items feed the command deck queue

**Done when:** monetization and loop outputs become actionable system inputs rather than static seed content.

## Phase 5 — Verification and ship
- Build the app
- Fix type/runtime issues
- Verify all major pages still render
- Prepare for deploy/push

**Done when:** production build passes and the upgraded control center is safe to ship.
