'use client'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { HeartbeatType, ImportanceLevel } from '@/lib/types'

const hbTypeColor: Record<HeartbeatType, string> = {
  reflection: 'text-lana-blue bg-blue-500/10',
  research: 'text-lana-mint bg-green-500/10',
  opportunity: 'text-lana-gold bg-lana-gold/10',
  synthesis: 'text-lana-purple bg-purple-500/10',
}
const hbTypeLabel: Record<HeartbeatType, string> = {
  reflection: 'Reflection',
  research: 'Research',
  opportunity: 'Opportunity',
  synthesis: 'Synthesis',
}
const importanceColor: Record<ImportanceLevel, string> = {
  low: 'text-lana-muted border-lana-border',
  medium: 'text-lana-amber border-lana-amber/30',
  high: 'text-lana-red border-lana-red/30',
}
const importanceDot: Record<ImportanceLevel, string> = {
  low: 'bg-lana-muted',
  medium: 'bg-lana-amber',
  high: 'bg-lana-red',
}

export default function HeartbeatsPage() {
  const mounted = useMounted()
  const { heartbeats } = useLanaStore()

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  const sorted = [...heartbeats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="px-10 py-10 max-w-[860px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Loops</p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Heartbeat Timeline</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {heartbeats.length} recorded runs · reflection, research, opportunity, synthesis
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[86px] top-0 bottom-0 w-px bg-lana-border" />

        <div className="space-y-8">
          {sorted.map((entry, idx) => (
            <div key={entry.id} className="flex gap-6">
              {/* Date column */}
              <div className="w-[80px] flex-shrink-0 text-right pt-1">
                <p className="font-mono text-[10px] text-lana-muted leading-snug">
                  {format(new Date(entry.createdAt), 'MMM d')}
                </p>
                <p className="font-mono text-[9px] text-lana-muted opacity-60">
                  {format(new Date(entry.createdAt), 'HH:mm')}
                </p>
              </div>

              {/* Dot */}
              <div className="flex-shrink-0 flex flex-col items-center pt-1.5 relative z-10">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border',
                    idx === 0 ? 'bg-lana-gold border-lana-gold' : importanceDot[entry.importance],
                    idx !== 0 && 'border-transparent'
                  )}
                />
              </div>

              {/* Card */}
              <div
                className={cn(
                  'flex-1 border rounded-[3px] bg-surface-1 p-5 mb-1',
                  entry.importance === 'high'
                    ? 'border-lana-red/20'
                    : entry.importance === 'medium'
                    ? 'border-lana-amber/20'
                    : 'border-lana-border'
                )}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={cn(
                      'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]',
                      hbTypeColor[entry.runType]
                    )}
                  >
                    {hbTypeLabel[entry.runType]}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[8px] tracking-[0.14em] uppercase',
                      importanceColor[entry.importance]
                    )}
                  >
                    {entry.importance}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-[13px] text-lana-text-2 leading-relaxed mb-4">{entry.summary}</p>

                {/* Changes */}
                {entry.changes.length > 0 && (
                  <div className="mb-4">
                    <p className="font-mono text-[9px] text-lana-muted tracking-[0.18em] uppercase mb-2">
                      Changes Observed
                    </p>
                    <ul className="space-y-1.5">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-lana-muted">
                          <span className="text-lana-gold mt-0.5 flex-shrink-0">·</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-ups */}
                {entry.followUps.length > 0 && (
                  <div className="pt-3 border-t border-lana-border">
                    <p className="font-mono text-[9px] text-lana-muted tracking-[0.18em] uppercase mb-2">
                      Follow-Up Actions
                    </p>
                    <ul className="space-y-1.5">
                      {entry.followUps.map((fu, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-lana-text-2">
                          <span className="text-lana-blue mt-0.5 flex-shrink-0">→</span>
                          {fu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
