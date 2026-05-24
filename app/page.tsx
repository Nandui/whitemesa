'use client'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { PhaseStatus, ImportanceLevel, HeartbeatType } from '@/lib/types'

const statusColor: Record<PhaseStatus, string> = {
  not_started: 'text-lana-muted',
  in_progress: 'text-lana-gold',
  blocked: 'text-lana-red',
  completed: 'text-lana-green',
}
const statusBg: Record<PhaseStatus, string> = {
  not_started: 'bg-white/5',
  in_progress: 'bg-lana-gold/10',
  blocked: 'bg-red-500/10',
  completed: 'bg-green-500/10',
}
const statusLabel: Record<PhaseStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}
const importanceColor: Record<ImportanceLevel, string> = {
  low: 'text-lana-muted',
  medium: 'text-lana-amber',
  high: 'text-lana-red',
}
const hbTypeLabel: Record<HeartbeatType, string> = {
  reflection: 'Reflection',
  research: 'Research',
  opportunity: 'Opportunity',
  synthesis: 'Synthesis',
}

export default function CommandDeck() {
  const mounted = useMounted()
  const { phases, heartbeats, opportunities, dossier, policy } = useLanaStore()

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Initializing...
        </span>
      </div>
    )
  }

  const activePhase = phases.find((p) => p.status === 'in_progress')
  const overallProgress = Math.round(phases.reduce((acc, p) => acc + p.progress, 0) / phases.length)
  const latestHeartbeat = heartbeats[0]
  const openOpps = opportunities.filter((o) => o.status !== 'won' && o.status !== 'lost')
  const readyOpps = opportunities.filter((o) => o.status === 'ready')
  const phasesWithBlockers = phases.filter((p) => p.blockers.length > 0 && p.status !== 'completed')
  const completedPhases = phases.filter((p) => p.status === 'completed').length

  const alerts: string[] = [
    ...readyOpps.map((o) => `Opportunity pending operator review: ${o.name}`),
    ...phasesWithBlockers.slice(0, 2).flatMap((p) => p.blockers.map((b) => `[${p.name}] ${b}`)),
  ]

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto animate-fade-in">
      {/* System strip */}
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-lana-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-lana-green animate-pulse-slow" />
          <span className="font-mono text-[9px] text-lana-muted tracking-[0.22em] uppercase">System Active</span>
        </div>
        <div className="w-px h-3 bg-lana-border" />
        <span className="font-mono text-[9px] text-lana-muted tracking-[0.15em] uppercase">
          Build {dossier.version}
        </span>
        <div className="w-px h-3 bg-lana-border" />
        <span className="font-mono text-[9px] text-lana-muted tracking-[0.15em] uppercase">
          Mode: {policy.autonomyMode.replace('_', ' ')}
        </span>
        <div className="w-px h-3 bg-lana-border" />
        <span className="font-mono text-[9px] text-lana-muted tracking-[0.15em] uppercase">
          {format(new Date(), 'dd MMM yyyy')}
        </span>
      </div>

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Command Deck</h1>
        <p className="text-[13px] text-lana-muted mt-1">Operator overview · Lana Hayes synthetic person project</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <KpiCard
          label="Active Phase"
          value={activePhase ? activePhase.name : 'None'}
          sub={activePhase ? `${activePhase.progress}% complete` : 'All phases complete'}
          accent="gold"
        />
        <KpiCard
          label="Overall Progress"
          value={`${overallProgress}%`}
          sub={`${completedPhases}/${phases.length} phases done`}
          accent="default"
        />
        <KpiCard
          label="Open Opportunities"
          value={String(openOpps.length)}
          sub={`${readyOpps.length} awaiting review`}
          accent={readyOpps.length > 0 ? 'alert' : 'default'}
        />
        <KpiCard
          label="Last Loop"
          value={latestHeartbeat ? format(new Date(latestHeartbeat.createdAt), 'MMM d') : '—'}
          sub={latestHeartbeat ? hbTypeLabel[latestHeartbeat.runType] : '—'}
          accent="default"
        />
        <KpiCard
          label="Autonomy Mode"
          value={policy.autonomyMode.replace('_', '-')}
          sub="Current governance state"
          accent="default"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 border border-lana-gold/20 rounded-[3px] bg-lana-gold/[0.04] p-5">
          <p className="font-mono text-[9px] text-lana-gold tracking-[0.2em] uppercase mb-3">Operator Alerts</p>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1 h-1 rounded-full bg-lana-gold mt-1.5 flex-shrink-0" />
                <p className="text-[13px] text-lana-text-2">{alert}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Phase overview */}
        <div>
          <SectionLabel>Phase Overview</SectionLabel>
          <div className="space-y-3">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="border border-lana-border rounded-[3px] bg-surface-1 px-5 py-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-lana-text">{phase.name}</span>
                    <span
                      className={cn(
                        'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]',
                        statusBg[phase.status],
                        statusColor[phase.status]
                      )}
                    >
                      {statusLabel[phase.status]}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-lana-muted">{phase.progress}%</span>
                </div>
                <div className="h-[2px] bg-surface-3 rounded-full">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      phase.status === 'completed' ? 'bg-lana-green' :
                      phase.status === 'blocked' ? 'bg-lana-red' :
                      phase.status === 'in_progress' ? 'bg-lana-gold' : 'bg-surface-3'
                    )}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
                {phase.summary && (
                  <p className="text-[12px] text-lana-muted mt-2 leading-relaxed">{phase.summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Latest heartbeat */}
          {latestHeartbeat && (
            <div>
              <SectionLabel>Latest Loop</SectionLabel>
              <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]',
                      'bg-lana-gold/10 text-lana-gold'
                    )}
                  >
                    {hbTypeLabel[latestHeartbeat.runType]}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[8px] tracking-[0.12em] uppercase',
                      importanceColor[latestHeartbeat.importance]
                    )}
                  >
                    {latestHeartbeat.importance}
                  </span>
                </div>
                <p className="text-[12px] text-lana-muted mb-1">
                  {format(new Date(latestHeartbeat.createdAt), 'MMM d, yyyy · HH:mm')}
                </p>
                <p className="text-[13px] text-lana-text-2 leading-relaxed mb-3">{latestHeartbeat.summary}</p>
                {latestHeartbeat.changes.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] text-lana-muted tracking-widest uppercase mb-2">Changes</p>
                    <ul className="space-y-1">
                      {latestHeartbeat.changes.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-lana-muted">
                          <span className="text-lana-gold mt-0.5">·</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Open opportunities preview */}
          <div>
            <SectionLabel>Top Opportunities</SectionLabel>
            <div className="space-y-2">
              {openOpps.slice(0, 4).map((opp) => (
                <div
                  key={opp.id}
                  className="border border-lana-border rounded-[3px] bg-surface-1 px-4 py-3 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-lana-text truncate">{opp.name}</p>
                    <p className="text-[11px] text-lana-muted mt-0.5 truncate">{opp.nextAction}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-mono text-[11px] text-lana-gold">
                      {Math.round(opp.fitScore * 100)}%
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-[2px]',
                        opp.status === 'ready' ? 'bg-lana-gold/10 text-lana-gold' :
                        opp.status === 'contacted' ? 'bg-blue-500/10 text-lana-blue' :
                        opp.status === 'negotiating' ? 'bg-purple-500/10 text-lana-purple' :
                        'bg-white/5 text-lana-muted'
                      )}
                    >
                      {opp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: 'gold' | 'alert' | 'default'
}) {
  return (
    <div
      className={cn(
        'border rounded-[3px] bg-surface-1 px-5 py-4',
        accent === 'gold' ? 'border-lana-gold/20' :
        accent === 'alert' ? 'border-lana-gold/30' :
        'border-lana-border'
      )}
    >
      <p className="font-mono text-[9px] text-lana-muted tracking-[0.18em] uppercase mb-2">{label}</p>
      <p
        className={cn(
          'text-xl font-semibold tracking-tight leading-none mb-1',
          accent === 'gold' ? 'text-lana-gold' :
          accent === 'alert' ? 'text-lana-gold' :
          'text-lana-text'
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-lana-muted">{sub}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-3">{children}</p>
  )
}
