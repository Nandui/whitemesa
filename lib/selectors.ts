'use client'

import type {
  HeartbeatEntry,
  Opportunity,
  PhaseStatus,
  PriorityLevel,
  ProjectPhase,
  SystemOwner,
  Task,
} from './types'

export interface DerivedTask extends Task {
  effectivePriority: PriorityLevel
  isDependencyBlocked: boolean
  dependencyTitles: string[]
}

export interface DerivedPhase extends ProjectPhase {
  derivedProgress: number
  derivedStatus: PhaseStatus
  completedTasks: number
  totalTasks: number
  nextTask?: DerivedTask
}

export interface ActionQueueItem {
  id: string
  title: string
  detail: string
  category: 'blocker' | 'task' | 'opportunity' | 'heartbeat'
  priority: PriorityLevel
  owner: SystemOwner
  phaseName?: string
  dueLabel?: string
  reason: string
}

const statusWeight = {
  not_started: 0,
  blocked: 25,
  in_progress: 50,
  completed: 100,
} as const

const priorityWeight = {
  high: 0,
  medium: 1,
  low: 2,
} as const

function getEffectivePriority(priority?: PriorityLevel): PriorityLevel {
  return priority ?? 'medium'
}

function daysUntil(date?: string): number | null {
  if (!date) return null

  const now = new Date()
  const target = new Date(date)
  if (Number.isNaN(target.getTime())) return null

  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDueLabel(date?: string): string | undefined {
  const diff = daysUntil(date)
  if (diff === null) return undefined
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'due today'
  if (diff === 1) return 'due tomorrow'
  return `due in ${diff}d`
}

export function derivePhaseProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const total = tasks.reduce((sum, task) => sum + statusWeight[task.status], 0)
  return Math.round(total / tasks.length)
}

export function derivePhaseStatus(tasks: Task[], blockers: string[]): PhaseStatus {
  if (tasks.length === 0) {
    return blockers.length > 0 ? 'blocked' : 'not_started'
  }

  const allCompleted = tasks.every((task) => task.status === 'completed')
  if (allCompleted) return 'completed'

  const hasBlockedTask = tasks.some((task) => task.status === 'blocked')
  if (hasBlockedTask || blockers.length > 0) return 'blocked'

  const hasStartedTask = tasks.some((task) => task.status === 'in_progress' || task.status === 'completed')
  if (hasStartedTask) return 'in_progress'

  return 'not_started'
}

function deriveTask(task: Task, tasks: Task[]): DerivedTask {
  const dependencies = task.dependsOn ?? []
  const dependencyTitles = dependencies
    .map((dependencyId) => tasks.find((candidate) => candidate.id === dependencyId))
    .filter((task): task is Task => Boolean(task))
    .map((task) => task.title)

  const isDependencyBlocked = dependencies.some((dependencyId) => {
    const dependency = tasks.find((candidate) => candidate.id === dependencyId)
    return dependency ? dependency.status !== 'completed' : false
  })

  return {
    ...task,
    effectivePriority: getEffectivePriority(task.priority),
    isDependencyBlocked,
    dependencyTitles,
  }
}

function chooseNextTask(tasks: Task[]): DerivedTask | undefined {
  const derivedTasks = tasks
    .filter((task) => task.status !== 'completed')
    .map((task) => deriveTask(task, tasks))

  if (derivedTasks.length === 0) return undefined

  const inProgress = derivedTasks.filter((task) => task.status === 'in_progress')
  const ready = derivedTasks.filter((task) => task.status === 'not_started' && !task.isDependencyBlocked)
  const blocked = derivedTasks.filter((task) => task.status === 'blocked' || task.isDependencyBlocked)
  const backlog = derivedTasks.filter((task) => task.status === 'not_started' && task.isDependencyBlocked)

  const sortByPriorityAndDue = (a: DerivedTask, b: DerivedTask) => {
    if (priorityWeight[a.effectivePriority] !== priorityWeight[b.effectivePriority]) {
      return priorityWeight[a.effectivePriority] - priorityWeight[b.effectivePriority]
    }

    const aDue = daysUntil(a.dueDate)
    const bDue = daysUntil(b.dueDate)

    if (aDue !== null && bDue !== null) return aDue - bDue
    if (aDue !== null) return -1
    if (bDue !== null) return 1
    return a.title.localeCompare(b.title)
  }

  if (inProgress.length > 0) return [...inProgress].sort(sortByPriorityAndDue)[0]
  if (ready.length > 0) return [...ready].sort(sortByPriorityAndDue)[0]
  if (blocked.length > 0) return [...blocked].sort(sortByPriorityAndDue)[0]
  return [...backlog].sort(sortByPriorityAndDue)[0]
}

export function derivePhase(phase: ProjectPhase): DerivedPhase {
  const completedTasks = phase.tasks.filter((task) => task.status === 'completed').length
  const nextTask = chooseNextTask(phase.tasks)

  return {
    ...phase,
    derivedProgress: derivePhaseProgress(phase.tasks),
    derivedStatus: derivePhaseStatus(phase.tasks, phase.blockers),
    completedTasks,
    totalTasks: phase.tasks.length,
    nextTask,
  }
}

export function derivePhases(phases: ProjectPhase[]): DerivedPhase[] {
  return phases.map(derivePhase)
}

export function deriveOverallProgress(phases: ProjectPhase[]): number {
  const derived = derivePhases(phases)
  if (derived.length === 0) return 0

  return Math.round(derived.reduce((sum, phase) => sum + phase.derivedProgress, 0) / derived.length)
}

export function getOperatorActionQueue(
  phases: ProjectPhase[],
  heartbeats: HeartbeatEntry[],
  opportunities: Opportunity[]
): ActionQueueItem[] {
  const derived = derivePhases(phases)
  const items: Array<ActionQueueItem & { rank: number }> = []

  for (const phase of derived) {
    if (phase.blockers.length > 0) {
      for (const blocker of phase.blockers) {
        items.push({
          id: `${phase.id}-blocker-${blocker}`,
          title: `Resolve blocker in ${phase.name}`,
          detail: blocker,
          category: 'blocker',
          priority: 'high',
          owner: 'operator',
          phaseName: phase.name,
          reason: 'Blockers freeze phase progress until an operator clears them.',
          rank: -100,
        })
      }
    }

    if (phase.nextTask) {
      const task = phase.nextTask
      const due = formatDueLabel(task.dueDate)
      const dependencyText = task.dependencyTitles.length > 0 ? ` Dependencies: ${task.dependencyTitles.join(', ')}.` : ''
      let reason = 'Highest-priority unfinished task in this phase.'
      let priority: PriorityLevel = task.effectivePriority
      let rank = priorityWeight[task.effectivePriority] * 10

      if (task.status === 'in_progress') {
        reason = 'Already in motion — finishing current work creates the fastest real progress.'
        priority = 'high'
        rank = -80
      } else if (task.isDependencyBlocked) {
        reason = 'Cannot start cleanly until dependency work is completed.'
        priority = 'medium'
        rank = -20
      } else if (due) {
        reason = `Ready to execute and ${due}.`
        rank -= 5
      }

      items.push({
        id: `${phase.id}-task-${task.id}`,
        title: `${phase.name} → ${task.title}`,
        detail: `${task.definitionOfDone ? `Done when: ${task.definitionOfDone}. ` : ''}${task.notes ? `${task.notes}. ` : ''}${dependencyText}`.trim(),
        category: 'task',
        priority,
        owner: task.owner,
        phaseName: phase.name,
        dueLabel: due,
        reason,
        rank,
      })
    }
  }

  for (const opportunity of opportunities) {
    if (['ready', 'contacted', 'negotiating'].includes(opportunity.status)) {
      const priority = opportunity.status === 'negotiating' ? 'high' : getEffectivePriority(opportunity.priority)
      const due = formatDueLabel(opportunity.dueDate)
      items.push({
        id: `opp-${opportunity.id}`,
        title: `Opportunity: ${opportunity.name}`,
        detail: opportunity.nextAction,
        category: 'opportunity',
        priority,
        owner: opportunity.owner ?? 'operator',
        dueLabel: due,
        reason:
          opportunity.status === 'negotiating'
            ? 'Active deal motion — delaying risks losing the opportunity.'
            : opportunity.status === 'contacted'
              ? 'Conversation is already open and needs follow-through.'
              : 'High-fit opportunity is ready for an operator decision.',
        rank: opportunity.status === 'negotiating' ? -60 : opportunity.status === 'contacted' ? -35 : -25,
      })
    }
  }

  const sortedHeartbeats = [...heartbeats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  for (const heartbeat of sortedHeartbeats.slice(0, 3)) {
    for (const followUp of heartbeat.followUps.filter((entry) => entry.status !== 'completed')) {
      const due = formatDueLabel(followUp.dueDate)
      items.push({
        id: `heartbeat-${heartbeat.id}-${followUp.id}`,
        title: `Heartbeat follow-up · ${followUp.text}`,
        detail: `From ${heartbeat.runType} loop on ${new Date(heartbeat.createdAt).toLocaleDateString()}.`,
        category: 'heartbeat',
        priority:
          heartbeat.importance === 'high'
            ? 'high'
            : followUp.status === 'in_progress'
              ? 'medium'
              : 'low',
        owner: followUp.owner,
        dueLabel: due,
        reason:
          followUp.status === 'in_progress'
            ? 'Loop output is already being worked and should be closed out.'
            : 'Open follow-up from a heartbeat loop that should feed back into operations.',
        rank: heartbeat.importance === 'high' ? -30 : -10,
      })
    }
  }

  return items
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[a.priority] - priorityWeight[b.priority]
      }
      return a.title.localeCompare(b.title)
    })
    .slice(0, 10)
    .map(({ rank, ...item }) => item)
}
