'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  seedPhases,
  seedDossier,
  seedMemories,
  seedHeartbeats,
  seedOpportunities,
  seedPolicy,
} from './seed'
import type {
  ProjectPhase,
  PhaseStatus,
  TaskStatus,
  Dossier,
  MemoryEntry,
  HeartbeatEntry,
  Opportunity,
  OpportunityStatus,
  OperatorPolicy,
  AutonomyMode,
} from './types'

interface LanaStore {
  phases: ProjectPhase[]
  dossier: Dossier
  memories: MemoryEntry[]
  heartbeats: HeartbeatEntry[]
  opportunities: Opportunity[]
  policy: OperatorPolicy

  updatePhaseStatus: (phaseId: string, status: PhaseStatus) => void
  updateTaskStatus: (phaseId: string, taskId: string, status: TaskStatus) => void
  updateOpportunityStatus: (opportunityId: string, status: OpportunityStatus) => void
  updateAutonomyMode: (mode: AutonomyMode) => void
  resetToSeed: () => void
}

export const useLanaStore = create<LanaStore>()(
  persist(
    (set) => ({
      phases: seedPhases,
      dossier: seedDossier,
      memories: seedMemories,
      heartbeats: seedHeartbeats,
      opportunities: seedOpportunities,
      policy: seedPolicy,

      updatePhaseStatus: (phaseId, status) =>
        set((state) => ({
          phases: state.phases.map((p) => (p.id === phaseId ? { ...p, status } : p)),
        })),

      updateTaskStatus: (phaseId, taskId, status) =>
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === phaseId
              ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }
              : p
          ),
        })),

      updateOpportunityStatus: (opportunityId, status) =>
        set((state) => ({
          opportunities: state.opportunities.map((o) => (o.id === opportunityId ? { ...o, status } : o)),
        })),

      updateAutonomyMode: (mode) =>
        set((state) => ({
          policy: { ...state.policy, autonomyMode: mode },
        })),

      resetToSeed: () =>
        set({
          phases: seedPhases,
          dossier: seedDossier,
          memories: seedMemories,
          heartbeats: seedHeartbeats,
          opportunities: seedOpportunities,
          policy: seedPolicy,
        }),
    }),
    {
      name: 'lana-control-center-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
