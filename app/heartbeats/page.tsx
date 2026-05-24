'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { FollowUpStatus, HeartbeatType, ImportanceLevel, SystemOwner } from '@/lib/types'

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
const followUpStatuses: FollowUpStatus[] = ['pending', 'in_progress', 'completed']
const owners: SystemOwner[] = ['operator', 'lana', 'shared', 'system']

export default function HeartbeatsPage() {
  const mounted = useMounted()
  const { heartbeats, updateHeartbeatFollowUpStatus, addHeartbeatFollowUp } = useLanaStore()
  const [draftText, setDraftText] = useState<Record<string, string>>({})
  const [draftOwner, setDraftOwner] = useState<Record<string, SystemOwner>>({})

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
    <div className="px-10 py-10 max-w-[980px] mx-auto animate-fade-in">
      <div className="mb-10">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Loops</p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Heartbeat Timeline</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {heartbeats.length} recorded runs · reflection, research, opportunity, synthesis
        </p>
        <p className="text-[12px] text-lana-muted mt-2">
          Follow-ups here are live work items now. Mark them done or add new next steps from each loop.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-[86px] top-0 bottom-0 w-px bg-lana-border" />

        <div className="space-y-8">
          {sorted.map((entry, idx) => (
            <div key={entry.id} className="flex gap-6">
              <div className="w-[80px] flex-shrink-0 text-right pt-1">
                <p className="font-mono text-[10px] text-lana-muted leading-snug">
                  {format(new Date(entry.createdAt), 'MMM d')}
                </p>
                <p className="font-mono text-[9px] text-lana-muted opacity-60">
                  {format(new Date(entry.createdAt), 'HH:mm')}
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center pt-1.5 relative z-10">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border',
                    idx === 0 ? 'bg-lana-gold border-lana-gold' : importanceDot[entry.importance],
                    idx !== 0 && 'border-transparent'
                  )}
                />
              </div>

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

                <p className="text-[13px] text-lana-text-2 leading-relaxed mb-4">{entry.summary}</p>

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

                <div className="pt-3 border-t border-lana-border">
                  <p className="font-mono text-[9px] text-lana-muted tracking-[0.18em] uppercase mb-2">
                    Follow-Up Actions
                  </p>
                  <div className="space-y-2">
                    {entry.followUps.length === 0 && (
                      <p className="text-[12px] text-lana-muted">No follow-ups recorded.</p>
                    )}
                    {entry.followUps.map((followUp) => (
                      <div key={followUp.id} className="border border-lana-border rounded-[2px] bg-surface-2 px-3 py-2">
                        <div className="grid grid-cols-[1fr_130px_120px_110px] gap-3 items-start">
                          <p className="text-[12px] text-lana-text-2 leading-relaxed">{followUp.text}</p>
                          <select
                            value={followUp.status}
                            onChange={(e) => updateHeartbeatFollowUpStatus(entry.id, followUp.id, e.target.value as FollowUpStatus)}
                            className="bg-surface-3 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40"
                          >
                            {followUpStatuses.map((status) => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <span className="font-mono text-[8px] tracking-widest uppercase text-lana-muted self-center">{followUp.owner}</span>
                          <span className="font-mono text-[8px] tracking-widest uppercase text-lana-muted self-center">{followUp.dueDate ?? 'no due date'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border border-dashed border-lana-border rounded-[3px] p-3 bg-surface-2/60">
                    <div className="grid grid-cols-[1fr_120px_auto] gap-3">
                      <input
                        value={draftText[entry.id] ?? ''}
                        onChange={(e) => setDraftText((state) => ({ ...state, [entry.id]: e.target.value }))}
                        placeholder="Add follow-up action"
                        className="bg-surface-1 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40"
                      />
                      <select
                        value={draftOwner[entry.id] ?? 'shared'}
                        onChange={(e) => setDraftOwner((state) => ({ ...state, [entry.id]: e.target.value as SystemOwner }))}
                        className="bg-surface-1 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40"
                      >
                        {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          const text = (draftText[entry.id] ?? '').trim()
                          if (!text) return
                          addHeartbeatFollowUp(entry.id, {
                            id: `${entry.id}-${Date.now()}`,
                            text,
                            status: 'pending',
                            owner: draftOwner[entry.id] ?? 'shared',
                          })
                          setDraftText((state) => ({ ...state, [entry.id]: '' }))
                        }}
                        className="rounded-[2px] bg-lana-gold/10 text-lana-gold px-3 py-2 text-[11px] font-mono tracking-[0.16em] uppercase"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
