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
  Task,
  HeartbeatFollowUp,
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
  addTask: (phaseId: string, task: Task) => void
  updateTask: (phaseId: string, taskId: string, updates: Partial<Task>) => void
  removeTask: (phaseId: string, taskId: string) => void
  addBlocker: (phaseId: string, blocker: string) => void
  removeBlocker: (phaseId: string, blockerIndex: number) => void

  updateOpportunityStatus: (opportunityId: string, status: OpportunityStatus) => void
  addOpportunity: (opportunity: Opportunity) => void
  updateOpportunity: (opportunityId: string, updates: Partial<Opportunity>) => void
  removeOpportunity: (opportunityId: string) => void

  updateHeartbeatFollowUpStatus: (heartbeatId: string, followUpId: string, status: HeartbeatFollowUp['status']) => void
  addHeartbeatFollowUp: (heartbeatId: string, followUp: HeartbeatFollowUp) => void

  updateAutonomyMode: (mode: AutonomyMode) => void
  resetToSeed: () => void
}

const nowIso = () => new Date().toISOString()

function normalizeTask(task: any): Task {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    owner: task.owner,
    notes: task.notes,
    priority: task.priority ?? 'medium',
    dueDate: task.dueDate,
    definitionOfDone: task.definitionOfDone,
    dependsOn: task.dependsOn ?? [],
  }
}

function normalizePhase(phase: any): ProjectPhase {
  return {
    id: phase.id,
    name: phase.name,
    status: phase.status,
    progress: phase.progress ?? 0,
    summary: phase.summary,
    tasks: (phase.tasks ?? []).map(normalizeTask),
    blockers: phase.blockers ?? [],
    notes: phase.notes ?? [],
  }
}

function normalizeFollowUp(followUp: any, fallbackId: string): HeartbeatFollowUp {
  if (typeof followUp === 'string') {
    return {
      id: fallbackId,
      text: followUp,
      status: 'pending',
      owner: 'system',
    }
  }

  return {
    id: followUp.id ?? fallbackId,
    text: followUp.text,
    status: followUp.status ?? 'pending',
    owner: followUp.owner ?? 'system',
    dueDate: followUp.dueDate,
  }
}

function normalizeHeartbeat(heartbeat: any): HeartbeatEntry {
  return {
    id: heartbeat.id,
    runType: heartbeat.runType,
    createdAt: heartbeat.createdAt,
    summary: heartbeat.summary,
    changes: heartbeat.changes ?? [],
    followUps: (heartbeat.followUps ?? []).map((followUp: any, index: number) =>
      normalizeFollowUp(followUp, `${heartbeat.id}-fu-${index + 1}`)
    ),
    importance: heartbeat.importance,
  }
}

function normalizeOpportunity(opportunity: any): Opportunity {
  return {
    id: opportunity.id,
    name: opportunity.name,
    type: opportunity.type,
    status: opportunity.status,
    fitScore: opportunity.fitScore,
    estimatedValue: opportunity.estimatedValue,
    nextAction: opportunity.nextAction,
    notes: opportunity.notes,
    priority: opportunity.priority ?? 'medium',
    owner: opportunity.owner ?? 'operator',
    dueDate: opportunity.dueDate,
    lastUpdatedAt: opportunity.lastUpdatedAt ?? nowIso(),
  }
}

function normalizeState(state: Partial<LanaStore> | undefined) {
  return {
    phases: (state?.phases ?? seedPhases).map(normalizePhase),
    dossier: state?.dossier ?? seedDossier,
    memories: state?.memories ?? seedMemories,
    heartbeats: (state?.heartbeats ?? seedHeartbeats).map(normalizeHeartbeat),
    opportunities: (state?.opportunities ?? seedOpportunities).map(normalizeOpportunity),
    policy: state?.policy ?? seedPolicy,
  }
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
              ? {
                  ...p,
                  tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
                }
              : p
          ),
        })),

      addTask: (phaseId, task) =>
        set((state) => ({
          phases: state.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  tasks: [...phase.tasks, normalizeTask(task)],
                }
              : phase
          ),
        })),

      updateTask: (phaseId, taskId, updates) =>
        set((state) => ({
          phases: state.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  tasks: phase.tasks.map((task) =>
                    task.id === taskId
                      ? normalizeTask({ ...task, ...updates })
                      : task
                  ),
                }
              : phase
          ),
        })),

      removeTask: (phaseId, taskId) =>
        set((state) => ({
          phases: state.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  tasks: phase.tasks.filter((task) => task.id !== taskId),
                }
              : phase
          ),
        })),

      addBlocker: (phaseId, blocker) =>
        set((state) => ({
          phases: state.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  blockers: [...phase.blockers, blocker],
                }
              : phase
          ),
        })),

      removeBlocker: (phaseId, blockerIndex) =>
        set((state) => ({
          phases: state.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  blockers: phase.blockers.filter((_, index) => index !== blockerIndex),
                }
              : phase
          ),
        })),

      updateOpportunityStatus: (opportunityId, status) =>
        set((state) => ({
          opportunities: state.opportunities.map((opportunity) =>
            opportunity.id === opportunityId
              ? {
                  ...opportunity,
                  status,
                  lastUpdatedAt: nowIso(),
                }
              : opportunity
          ),
        })),

      addOpportunity: (opportunity) =>
        set((state) => ({
          opportunities: [normalizeOpportunity(opportunity), ...state.opportunities],
        })),

      updateOpportunity: (opportunityId, updates) =>
        set((state) => ({
          opportunities: state.opportunities.map((opportunity) =>
            opportunity.id === opportunityId
              ? normalizeOpportunity({ ...opportunity, ...updates, lastUpdatedAt: nowIso() })
              : opportunity
          ),
        })),

      removeOpportunity: (opportunityId) =>
        set((state) => ({
          opportunities: state.opportunities.filter((opportunity) => opportunity.id !== opportunityId),
        })),

      updateHeartbeatFollowUpStatus: (heartbeatId, followUpId, status) =>
        set((state) => ({
          heartbeats: state.heartbeats.map((heartbeat) =>
            heartbeat.id === heartbeatId
              ? {
                  ...heartbeat,
                  followUps: heartbeat.followUps.map((followUp) =>
                    followUp.id === followUpId ? { ...followUp, status } : followUp
                  ),
                }
              : heartbeat
          ),
        })),

      addHeartbeatFollowUp: (heartbeatId, followUp) =>
        set((state) => ({
          heartbeats: state.heartbeats.map((heartbeat) =>
            heartbeat.id === heartbeatId
              ? {
                  ...heartbeat,
                  followUps: [...heartbeat.followUps, normalizeFollowUp(followUp, `${heartbeatId}-${heartbeat.followUps.length + 1}`)],
                }
              : heartbeat
          ),
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => normalizeState(persistedState as Partial<LanaStore>),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizeState(persistedState as Partial<LanaStore>),
      }),
    }
  )
)
