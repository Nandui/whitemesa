# Lana Control Center v1 Implementation Plan

> **For Hermes:** Use Claude Code to implement this plan in a new standalone web app. Build the cinematic dashboard first, then wire in local data persistence and operator workflows.

**Goal:** Create a Westworld-inspired operator dashboard for overseeing Lana Hayes as a persistent synthetic person project: identity, roadmap, memory, heartbeats, autonomy, and monetization.

**Architecture:** Build a local-first single-page web app with a premium cinematic UI, structured around modules: Command Deck, Dossier, Roadmap, Memory/Reflection, Heartbeats, Opportunities, and Operator Controls. Store data in local JSON/IndexedDB first so the tool works immediately without backend complexity, but keep the data model ready for a future API/database.

**Tech Stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui (or similar component primitives) + local JSON seed data and browser persistence.

---

## Product Intent

This is **not** a generic project tracker. It is an **operator command center** for building, observing, guiding, and monetizing Lana Hayes.

The experience should feel:
- cinematic
- elegant
- dark / premium / lab-like
- precise and god-view
- inspired by Westworld control rooms, without copying them

The app must help operators:
- track what is built vs not built
- monitor Lana's identity/state
- log reflections, research, and memory growth
- monitor heartbeat loops and deviations
- track monetization opportunities and status
- define autonomy permissions and intervention points

---

## V1 Feature Scope

### 1. Command Deck
Top-level overview page with:
- current phase of Lana project
- overall completion progress
- latest heartbeat run
- current autonomy mode
- open opportunities count
- urgent operator alerts
- recent changes feed

### 2. Lana Dossier
Structured profile page with:
- core identity summary
- soul/version metadata
- current traits
- goals
- boundaries
- public persona summary
- operator notes

### 3. Master Roadmap
Track major phases:
- Foundation
- Brain
- Heartbeat
- Public Self
- Money Engine
- Controlled Autonomy

Each phase must show:
- status
- progress percentage
- tasks
- blockers
- notes

### 4. Memory & Reflection
A panel for:
- durable memory items
- recent reflections
- research notes summaries
- synthesis entries
- tags/categories

### 5. Heartbeat Timeline
Timeline/log for periodic Lana runs:
- timestamp
- type (reflection/research/opportunity/synthesis)
- summary of what happened
- changes observed
- follow-up actions
- severity/importance

### 6. Opportunity Pipeline
Track monetization opportunities:
- lead/brand name
- category (UGC, sponsorship, affiliate, etc.)
- fit score
- status
- next action
- estimated value
- notes

### 7. Operator Controls
Track governance and permissions:
- current autonomy mode
- actions Lana can take freely
- actions requiring approval
- emergency override notes
- intervention/change log

---

## UX / Visual Direction

### Visual qualities
- black / charcoal / graphite backgrounds
- ivory / white typography
- muted gold or cool neutral accent
- glass panels / thin borders / restrained glow
- wide spacing
- sophisticated typography
- subtle scanning/telemetry feel

### Avoid
- bright SaaS colors
- playful startup look
- cluttered PM board aesthetic
- cartoon sci-fi kitsch

### Layout direction
- desktop-first dashboard
- left rail navigation
- upper command/status strip
- modular cards/panels
- timeline + dossier + telemetry sections

---

## Data Model (V1)

Create structured local seed data for:

```ts
ProjectPhase {
  id: string
  name: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed'
  progress: number
  summary: string
  tasks: Task[]
  blockers: string[]
  notes: string[]
}

Task {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed'
  owner: 'operator' | 'lana' | 'shared'
  notes?: string
}

Dossier {
  name: string
  subtitle: string
  identitySummary: string
  goals: string[]
  traits: string[]
  boundaries: string[]
  publicPersona: string
  currentMode: string
}

MemoryEntry {
  id: string
  type: 'durable' | 'reflection' | 'research' | 'synthesis'
  title: string
  summary: string
  tags: string[]
  createdAt: string
}

HeartbeatEntry {
  id: string
  runType: 'reflection' | 'research' | 'opportunity' | 'synthesis'
  createdAt: string
  summary: string
  changes: string[]
  followUps: string[]
  importance: 'low' | 'medium' | 'high'
}

Opportunity {
  id: string
  name: string
  type: 'ugc' | 'brand_deal' | 'affiliate' | 'partnership' | 'other'
  status: 'watching' | 'ready' | 'contacted' | 'negotiating' | 'won' | 'lost'
  fitScore: number
  estimatedValue?: string
  nextAction: string
  notes: string
}

OperatorPolicy {
  autonomyMode: 'contained' | 'supervised' | 'semi_autonomous' | 'open'
  allowedActions: string[]
  approvalRequired: string[]
  interventionNotes: string[]
}
```

---

## V1 Functional Requirements

1. App must boot with believable seed data for Lana.
2. User must be able to update statuses locally.
3. Status changes must persist in browser local storage or IndexedDB.
4. UI must support filtering/search at least for roadmap, memory, and opportunities.
5. Timeline and cards must render smoothly and clearly.
6. Command Deck must aggregate core metrics from seed/store data.
7. App must include a clean README with setup/run instructions.

---

## Suggested Build Tasks

### Task 1: Scaffold app
- Create Next.js TypeScript app
- Add Tailwind
- Add component primitives
- Set up app structure and theme tokens

### Task 2: Create visual system
- global layout
- typography
- color tokens
- dashboard shell
- navigation

### Task 3: Add seed data + store
- define TypeScript models
- create seed JSON/TS data
- create local persistence store

### Task 4: Build Command Deck
- KPI cards
- alerts
- recent activity
- project phase snapshot

### Task 5: Build Dossier page
- identity panels
- goals/traits/boundaries
- persona summary

### Task 6: Build Roadmap page
- phases
- tasks
- status updates
- blockers/notes

### Task 7: Build Memory & Reflection page
- list/tags/filter
- card detail presentation

### Task 8: Build Heartbeat Timeline
- timeline UI
- importance highlighting
- follow-up display

### Task 9: Build Opportunity Pipeline
- card/list view
- status chips
- fit score presentation

### Task 10: Build Operator Controls page
- autonomy mode
- permissions lists
- intervention log

### Task 11: Polish cinematic UX
- spacing
- motion
- hover states
- subtle ambient effects

### Task 12: README + verification
- startup instructions
- product summary
- next-step ideas

---

## V1 Non-Goals
Do **not** build yet:
- auth system
- real backend
- multi-user collaboration
- live cron ingestion
- real social API integrations
- real CRM automation
- complex DB migrations

Those can come in v2+.

---

## Verification Checklist
- [ ] Dashboard looks premium and cinematic
- [ ] Feels like operator command center, not generic admin panel
- [ ] Roadmap tracking is usable
- [ ] Lana dossier/state feels clear and meaningful
- [ ] Heartbeats and memory are visibly distinct concepts
- [ ] Opportunities are easy to scan
- [ ] Local persistence works after refresh
- [ ] README explains how to run and extend it

---

## Naming
Working name: **Lana Control Center**

Optional in-UI flavor labels:
- Command Deck
- Dossier
- Loops
- Memory Lattice
- Opportunity Surface
- Operator Policies
