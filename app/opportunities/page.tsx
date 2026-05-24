'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { OpportunityStatus, OpportunityType } from '@/lib/types'

const statusColor: Record<OpportunityStatus, string> = {
  watching: 'text-lana-muted bg-white/5',
  ready: 'text-lana-gold bg-lana-gold/10',
  contacted: 'text-lana-blue bg-blue-500/10',
  negotiating: 'text-lana-purple bg-purple-500/10',
  won: 'text-lana-green bg-green-500/10',
  lost: 'text-lana-muted bg-white/5',
}
const statusLabel: Record<OpportunityStatus, string> = {
  watching: 'Watching',
  ready: 'Ready',
  contacted: 'Contacted',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
}
const typeLabel: Record<OpportunityType, string> = {
  ugc: 'UGC',
  brand_deal: 'Brand Deal',
  affiliate: 'Affiliate',
  partnership: 'Partnership',
  other: 'Other',
}

const allStatuses: OpportunityStatus[] = ['watching', 'ready', 'contacted', 'negotiating', 'won', 'lost']

export default function OpportunitiesPage() {
  const mounted = useMounted()
  const { opportunities, updateOpportunityStatus } = useLanaStore()
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | 'all'>('all')

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  const sorted = [...opportunities].sort((a, b) => b.fitScore - a.fitScore)
  const filtered = filterStatus === 'all' ? sorted : sorted.filter((o) => o.status === filterStatus)

  const counts: Record<string, number> = {
    all: opportunities.length,
    ...Object.fromEntries(
      allStatuses.map((s) => [s, opportunities.filter((o) => o.status === s).length])
    ),
  }

  return (
    <div className="px-10 py-10 max-w-[940px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">
          Opportunity Surface
        </p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Pipeline</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {opportunities.length} total · {counts.ready ?? 0} ready for review ·{' '}
          {counts.negotiating ?? 0} negotiating
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {(['watching', 'ready', 'contacted', 'negotiating'] as const).map((s) => (
          <div key={s} className="border border-lana-border rounded-[3px] bg-surface-1 px-4 py-3">
            <p className="font-mono text-[9px] text-lana-muted tracking-[0.16em] uppercase mb-1">
              {statusLabel[s]}
            </p>
            <p
              className={cn(
                'text-xl font-semibold',
                s === 'ready' ? 'text-lana-gold' :
                s === 'contacted' ? 'text-lana-blue' :
                s === 'negotiating' ? 'text-lana-purple' : 'text-lana-text'
              )}
            >
              {counts[s] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all',
            filterStatus === 'all'
              ? 'bg-lana-gold/10 text-lana-gold'
              : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]'
          )}
        >
          All
        </button>
        {allStatuses.filter((s) => (counts[s] ?? 0) > 0).map((s) => (
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
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {/* Opportunity cards */}
      <div className="space-y-3">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className={cn(
              'border rounded-[3px] bg-surface-1 p-5',
              opp.status === 'ready' ? 'border-lana-gold/20' : 'border-lana-border'
            )}
          >
            <div className="flex items-start gap-5">
              {/* Fit score */}
              <div className="flex-shrink-0 w-[56px] text-center">
                <p className="font-mono text-[22px] font-semibold text-lana-gold leading-none">
                  {Math.round(opp.fitScore * 100)}
                </p>
                <p className="font-mono text-[8px] text-lana-muted tracking-widest uppercase mt-0.5">
                  Fit
                </p>
                <div className="mt-2 h-[2px] bg-surface-3 rounded-full">
                  <div
                    className="h-full bg-lana-gold rounded-full"
                    style={{ width: `${opp.fitScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[15px] font-medium text-lana-text">{opp.name}</h3>
                  <span
                    className={cn(
                      'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]',
                      statusColor[opp.status]
                    )}
                  >
                    {statusLabel[opp.status]}
                  </span>
                  <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.04] text-lana-muted border border-lana-border">
                    {typeLabel[opp.type]}
                  </span>
                </div>

                {opp.estimatedValue && (
                  <p className="text-[12px] text-lana-text-2 mb-1">
                    <span className="text-lana-muted">Est. value: </span>
                    {opp.estimatedValue}
                  </p>
                )}

                <p className="text-[12px] text-lana-muted mb-3 leading-relaxed">{opp.notes}</p>

                <div className="flex items-center gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-lana-blue text-[11px] flex-shrink-0 mt-0.5">→</span>
                    <p className="text-[12px] text-lana-text-2">{opp.nextAction}</p>
                  </div>

                  <select
                    value={opp.status}
                    onChange={(e) =>
                      updateOpportunityStatus(opp.id, e.target.value as OpportunityStatus)
                    }
                    className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40 flex-shrink-0"
                  >
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{statusLabel[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
