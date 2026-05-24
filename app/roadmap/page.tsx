'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { PhaseStatus, TaskStatus, TaskOwner } from '@/lib/types'

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

const phaseStatuses: PhaseStatus[] = ['not_started', 'in_progress', 'blocked', 'completed']
const taskStatuses: TaskStatus[] = ['not_started', 'in_progress', 'blocked', 'completed']

export default function RoadmapPage() {
  const mounted = useMounted()
  const { phases, updatePhaseStatus, updateTaskStatus } = useLanaStore()
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-2')
  const [filterStatus, setFilterStatus] = useState<PhaseStatus | 'all'>('all')

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  const filtered = filterStatus === 'all' ? phases : phases.filter((p) => p.status === filterStatus)

  return (
    <div className="px-10 py-10 max-w-[900px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Master Roadmap</p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Project Phases</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {phases.filter((p) => p.status === 'completed').length}/{phases.length} phases complete ·{' '}
          {Math.round(phases.reduce((a, p) => a + p.progress, 0) / phases.length)}% overall progress
        </p>
      </div>

      {/* Filter tabs */}
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

      {/* Phase cards */}
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
              {/* Phase header */}
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
                        phaseStatusBg[phase.status],
                        phaseStatusColor[phase.status]
                      )}
                    >
                      {phaseStatusLabel[phase.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-[2px] bg-surface-3 rounded-full max-w-[240px]">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          phase.status === 'completed' ? 'bg-lana-green' :
                          phase.status === 'blocked' ? 'bg-lana-red' : 'bg-lana-gold'
                        )}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-lana-muted">{phase.progress}%</span>
                  </div>
                </div>
                <span className={cn('font-mono text-[11px] transition-transform', isExpanded ? 'rotate-90' : '')}>›</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-lana-border px-6 pb-6 pt-5">
                  {/* Summary */}
                  <p className="text-[13px] text-lana-muted leading-relaxed mb-5">{phase.summary}</p>

                  {/* Status updater */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-[9px] text-lana-muted tracking-widest uppercase">Phase Status:</span>
                    <select
                      value={phase.status}
                      onChange={(e) => updatePhaseStatus(phase.id, e.target.value as PhaseStatus)}
                      className="bg-surface-2 border border-lana-border rounded-[2px] text-[12px] text-lana-text-2 px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                    >
                      {phaseStatuses.map((s) => (
                        <option key={s} value={s}>{phaseStatusLabel[s]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tasks */}
                  <div className="mb-5">
                    <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-3">Tasks</p>
                    <div className="space-y-2">
                      {phase.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-surface-2 border border-lana-border"
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full flex-shrink-0',
                              task.status === 'completed' ? 'bg-lana-green' :
                              task.status === 'in_progress' ? 'bg-lana-gold' :
                              task.status === 'blocked' ? 'bg-lana-red' : 'bg-surface-3'
                            )}
                          />
                          <p
                            className={cn(
                              'flex-1 text-[13px]',
                              task.status === 'completed' ? 'text-lana-muted line-through' : 'text-lana-text-2'
                            )}
                          >
                            {task.title}
                          </p>
                          {task.notes && (
                            <span className="text-[11px] text-lana-muted hidden lg:block max-w-[180px] truncate">
                              {task.notes}
                            </span>
                          )}
                          <span
                            className={cn(
                              'font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] flex-shrink-0',
                              ownerBadge[task.owner]
                            )}
                          >
                            {task.owner}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(phase.id, task.id, e.target.value as TaskStatus)
                            }
                            className="bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-0.5 font-mono outline-none focus:border-lana-gold/40 flex-shrink-0"
                          >
                            {taskStatuses.map((s) => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blockers */}
                  {phase.blockers.length > 0 && (
                    <div className="mb-4">
                      <p className="font-mono text-[9px] text-lana-red tracking-[0.2em] uppercase mb-2">Blockers</p>
                      <ul className="space-y-1.5">
                        {phase.blockers.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-lana-text-2">
                            <span className="text-lana-red mt-0.5">!</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
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
  )
}
