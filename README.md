# Lana Control Center

Operator command center for the Lana Hayes synthetic person project. A cinematic, local-first dashboard for overseeing identity, roadmap, memory, heartbeat loops, monetization opportunities, and governance policy.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** — custom dark design tokens
- **Zustand** — state management with localStorage persistence
- **date-fns** — date formatting
- **lucide-react** — icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Modules

| Route | Module | Purpose |
|-------|--------|---------|
| `/` | Command Deck | System overview — KPIs, alerts, phase snapshot, latest loop |
| `/dossier` | Dossier | Lana's identity, goals, traits, boundaries, public persona |
| `/roadmap` | Master Roadmap | Phase tracking with task-level status updates |
| `/memory` | Memory Lattice | Durable memory, reflections, research notes, syntheses |
| `/heartbeats` | Loops | Heartbeat timeline — reflection/research/opportunity/synthesis runs |
| `/opportunities` | Opportunity Surface | Monetization pipeline — UGC, brand deals, affiliates |
| `/operator` | Operator Policies | Autonomy mode selector, permissions, intervention log |

## Local Persistence

All state is stored in `localStorage` under the key `lana-control-center-v1`. Status changes on the Roadmap, Opportunities, and Operator pages persist across refreshes.

To reset to seed data: open browser devtools, run `localStorage.removeItem('lana-control-center-v1')`, and refresh.

## Extending

- **Add memory entries:** edit `lib/seed.ts` → `seedMemories` array, or add a form in `app/memory/page.tsx`.
- **Add heartbeat runs:** edit `seedHeartbeats` in `lib/seed.ts`.
- **Add opportunities:** edit `seedOpportunities`.
- **New data actions:** add a method to the store in `lib/store.ts`.

The data model is defined in `lib/types.ts` and kept backend-agnostic — ready for an API layer in v2.
