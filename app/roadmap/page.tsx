'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { deriveOverallProgress, derivePhases, getOperatorActionQueue } from '@/lib/selectors'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { PhaseStatus, PriorityLevel, TaskOwner, TaskStatus } from '@/lib/types'

const phaseStatusColor: Record<PhaseStatus, string> = {
  not_started: 'text-lana-muted',
  in_progress: 'text-lana-gold',
  blocked: 'text-lana-red',
  completed: 'text-lana-green',
}
const phaseStatusBg: Record<PhaseStatus, string> = {
  not_started: 'bg-white/5',
  in_progress: 'bg-lana-gold/10',
  blocked: 'bg-red-500/10',
  completed: 'bg-green-500/10',
}
const phaseStatusLabel: Record<PhaseStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}
const taskStatusColor: Record<TaskStatus, string> = {
  not_started: 'text-lana-muted',
  in_progress: 'text-lana-gold',
  blocked: 'text-lana-red',
  completed: 'text-lana-green',
}
const ownerBadge: Record<TaskOwner, string> = {
  operator: 'bg-blue-500/10 text-lana-blue',
  lana: 'bg-lana-gold/10 text-lana-gold',
  shared: 'bg-white/5 text-lana-muted',
}
const taskStatuses: TaskStatus[] = ['not_started', 'in_progress', 'blocked', 'completed']
const priorities: PriorityLevel[] = ['high', 'medium', 'low']
const owners: TaskOwner[] = ['operator', 'lana', 'shared']

export default function RoadmapPage() {
  const mounted = useMounted()
  const {
    phases,
    heartbeats,
    opportunities,
    updateTaskStatus,
    addTask,
    updateTask,
    removeTask,
    addBlocker,
    removeBlocker,
  } = useLanaStore()

  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-2')
  const [filterStatus, setFilterStatus] = useState<PhaseStatus | 'all'>('all')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskOwner, setNewTaskOwner] = useState<TaskOwner>('shared')
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskDefinition, setNewTaskDefinition] = useState('')
  const [newBlocker, setNewBlocker] = useState('')

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  const derivedPhases = derivePhases(phases)
  const overallProgress = deriveOverallProgress(phases)
  const filtered = filterStatus === 'all' ? derivedPhases : derivedPhases.filter((p) => p.derivedStatus === filterStatus)
  const actionQueue = getOperatorActionQueue(phases, heartbeats, opportunities)

  const resetTaskForm = () => {
    setNewTaskTitle('')
    setNewTaskOwner('shared')
    setNewTaskPriority('medium')
    setNewTaskDueDate('')
    setNewTaskDefinition('')
  }

  return (
    <div className="px-10 py-10 max-w-[1320px] mx-auto animate-fade-in">
      <div className="grid grid-cols-[1fr_380px] gap-8 items-start">
        <div>
          <div className="mb-8">
            <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Master Roadmap</p>
            <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Project Phases</h1>
            <p className="text-[13px] text-lana-muted mt-1">
              {derivedPhases.filter((p) => p.derivedStatus === 'completed').length}/{derivedPhases.length} phases complete · {overallProgress}% overall progress
            </p>
            <p className="text-[12px] text-lana-muted mt-2">
              This page is now meant to be worked from directly: update tasks, add blockers, and use the queue to decide what moves next.
            </p>
          </div>

          <div className="flex items-center gap-1 mb-6">
            {(['all', 'in_progress', 'not_started', 'blocked', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all',
                  filterStatus === s
                    ? 'bg-lana-gold/10 text-lana-gold'
                    : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]'
                )}
              >
                {s === 'all' ? 'All' : phaseStatusLabel[s]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((phase) => {
              const isExpanded = expandedPhase === phase.id

              return (
                <div
                  key={phase.id}
                  className={cn(
                    'border rounded-[3px] bg-surface-1 transition-all',
                    isExpanded ? 'border-lana-border-2' : 'border-lana-border'
                  )}
                >
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[14px] font-medium text-lana-text">{phase.name}</span>
                        <span
                          className={cn(
                            'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]',
                            phaseStatusBg[phase.derivedStatus],
                            phaseStatusColor[phase.derivedStatus]
                          )}
                        >
                          {phaseStatusLabel[phase.derivedStatus]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-[2px] bg-surface-3 rounded-full max-w-[240px]">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              phase.derivedStatus === 'completed' ? 'bg-lana-green' :
                              phase.derivedStatus === 'blocked' ? 'bg-lana-red' :
                              phase.derivedStatus === 'in_progress' ? 'bg-lana-gold' : 'bg-surface-3'
                            )}
                            style={{ width: `${phase.derivedProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-lana-muted">{phase.derivedProgress}%</span>
                      </div>
                    </div>
                    <span className={cn('font-mono text-[11px] transition-transform', isExpanded ? 'rotate-90' : '')}>›</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-lana-border px-6 pb-6 pt-5">
                      <p className="text-[13px] text-lana-muted leading-relaxed mb-5">{phase.summary}</p>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <MetricCard label="Task completion" value={`${phase.completedTasks}/${phase.totalTasks}`} />
                        <MetricCard label="Derived phase state" value={phaseStatusLabel[phase.derivedStatus]} />
                        <MetricCard label="Next task" value={phase.nextTask ? phase.nextTask.title : 'Done'} />
                      </div>

                      <div className="mb-5">
                        <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-3">Tasks</p>
                        <div className="space-y-3">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-[3px] bg-surface-2 border border-lana-border p-4"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5',
                                    task.status === 'completed' ? 'bg-lana-green' :
                                    task.status === 'in_progress' ? 'bg-lana-gold' :
                                    task.status === 'blocked' ? 'bg-lana-red' : 'bg-surface-3'
                                  )}
                                />
                                <div className="flex-1 grid grid-cols-[1.6fr_120px_110px_130px_auto] gap-3 items-start">
                                  <div>
                                    <input
                                      value={task.title}
                                      onChange={(e) => updateTask(phase.id, task.id, { title: e.target.value })}
                                      className="w-full bg-transparent text-[13px] text-lana-text outline-none border-b border-transparent focus:border-lana-gold/40 pb-1"
                                    />
                                    <textarea
                                      value={task.definitionOfDone ?? ''}
                                      onChange={(e) => updateTask(phase.id, task.id, { definitionOfDone: e.target.value })}
                                      placeholder="Definition of done"
                                      className="mt-2 w-full min-h-[58px] bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[11px] text-lana-muted outline-none focus:border-lana-gold/40"
                                    />
                                    <textarea
                                      value={task.notes ?? ''}
                                      onChange={(e) => updateTask(phase.id, task.id, { notes: e.target.value })}
                                      placeholder="Operator notes"
                                      className="mt-2 w-full min-h-[58px] bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[11px] text-lana-muted outline-none focus:border-lana-gold/40"
                                    />
                                  </div>
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(phase.id, task.id, e.target.value as TaskStatus)}
                                    className="bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                                  >
                                    {taskStatuses.map((s) => (
                                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={task.owner}
                                    onChange={(e) => updateTask(phase.id, task.id, { owner: e.target.value as TaskOwner })}
                                    className="bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                                  >
                                    {owners.map((owner) => (
                                      <option key={owner} value={owner}>{owner}</option>
                                    ))}
                                  </select>
                                  <div>
                                    <input
                                      type="date"
                                      value={task.dueDate ?? ''}
                                      onChange={(e) => updateTask(phase.id, task.id, { dueDate: e.target.value || undefined })}
                                      className="w-full bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                                    />
                                    <select
                                      value={task.priority ?? 'medium'}
                                      onChange={(e) => updateTask(phase.id, task.id, { priority: e.target.value as PriorityLevel })}
                                      className="w-full mt-2 bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                                    >
                                      {priorities.map((priority) => (
                                        <option key={priority} value={priority}>{priority}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => removeTask(phase.id, task.id)}
                                    className="text-[11px] text-lana-red hover:text-lana-text px-2 py-1"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-4">
                                <span className={cn('font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px]', ownerBadge[task.owner])}>
                                  {task.owner}
                                </span>
                                <span className={cn('text-[11px]', taskStatusColor[task.status])}>{task.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6 border border-dashed border-lana-border rounded-[3px] p-4 bg-surface-2/60">
                        <p className="font-mono text-[9px] text-lana-gold tracking-[0.18em] uppercase mb-3">Add task</p>
                        <div className="grid grid-cols-[1.5fr_120px_110px_130px] gap-3 mb-3">
                          <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title"
                            className="bg-surface-1 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40"
                          />
                          <select value={newTaskOwner} onChange={(e) => setNewTaskOwner(e.target.value as TaskOwner)} className="bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
                            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                          </select>
                          <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)} className="bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
                            {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                          </select>
                          <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40" />
                        </div>
                        <textarea
                          value={newTaskDefinition}
                          onChange={(e) => setNewTaskDefinition(e.target.value)}
                          placeholder="Definition of done"
                          className="w-full min-h-[64px] bg-surface-1 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-muted outline-none focus:border-lana-gold/40"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => {
                              if (!newTaskTitle.trim()) return
                              addTask(phase.id, {
                                id: `${phase.id}-${Date.now()}`,
                                title: newTaskTitle.trim(),
                                status: 'not_started',
                                owner: newTaskOwner,
                                priority: newTaskPriority,
                                dueDate: newTaskDueDate || undefined,
                                definitionOfDone: newTaskDefinition.trim() || undefined,
                                notes: '',
                                dependsOn: [],
                              })
                              resetTaskForm()
                            }}
                            className="rounded-[2px] bg-lana-gold/10 text-lana-gold px-3 py-2 text-[11px] font-mono tracking-[0.16em] uppercase"
                          >
                            Add task
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="font-mono text-[9px] text-lana-red tracking-[0.2em] uppercase mb-2">Blockers</p>
                        <div className="space-y-2">
                          {phase.blockers.map((blocker, index) => (
                            <div key={`${phase.id}-blocker-${index}`} className="flex items-start gap-3 border border-lana-border rounded-[2px] bg-surface-2 px-3 py-2">
                              <span className="text-lana-red mt-0.5">!</span>
                              <p className="flex-1 text-[12px] text-lana-text-2">{blocker}</p>
                              <button onClick={() => removeBlocker(phase.id, index)} className="text-[11px] text-lana-red">Clear</button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-3">
                          <input
                            value={newBlocker}
                            onChange={(e) => setNewBlocker(e.target.value)}
                            placeholder="Add blocker"
                            className="flex-1 bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40"
                          />
                          <button
                            onClick={() => {
                              if (!newBlocker.trim()) return
                              addBlocker(phase.id, newBlocker.trim())
                              setNewBlocker('')
                            }}
                            className="rounded-[2px] bg-red-500/10 text-lana-red px-3 py-2 text-[11px] font-mono tracking-[0.16em] uppercase"
                          >
                            Add blocker
                          </button>
                        </div>
                      </div>

                      {phase.notes.length > 0 && (
                        <div>
                          <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-2">Notes</p>
                          <ul className="space-y-1.5">
                            {phase.notes.map((n, i) => (
                              <li key={i} className="text-[12px] text-lana-muted pl-3 border-l border-lana-border">
                                {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-3">Operator Queue</p>
          <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5 space-y-3 sticky top-8">
            <p className="text-[12px] text-lana-muted leading-relaxed">
              This is your working stack: unblock, finish active work, then move ready tasks and live opportunities.
            </p>
            {actionQueue.map((item) => (
              <div key={item.id} className="border border-lana-border rounded-[2px] px-4 py-3 bg-surface-2">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-[13px] font-medium text-lana-text">{item.title}</p>
                  <span className={cn(
                    'font-mono text-[8px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-[2px]',
                    item.priority === 'high'
                      ? 'bg-red-500/10 text-lana-red'
                      : item.priority === 'medium'
                        ? 'bg-lana-gold/10 text-lana-gold'
                        : 'bg-white/5 text-lana-muted'
                  )}>{item.priority}</span>
                </div>
                <p className="text-[12px] text-lana-muted leading-relaxed">{item.detail || item.reason}</p>
                <p className="mt-2 text-[11px] text-lana-text-2">{item.reason}</p>
                <p className="mt-2 font-mono text-[8px] text-lana-muted tracking-[0.16em] uppercase">
                  {item.owner}{item.phaseName ? ` · ${item.phaseName}` : ''}{item.dueLabel ? ` · ${item.dueLabel}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-lana-border rounded-[3px] bg-surface-2 px-4 py-3">
      <p className="font-mono text-[8px] text-lana-muted tracking-[0.18em] uppercase mb-1">{label}</p>
      <p className="text-[13px] text-lana-text">{value}</p>
    </div>
  )
}
