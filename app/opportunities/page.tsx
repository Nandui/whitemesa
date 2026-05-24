'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { OpportunityStatus, OpportunityType, PriorityLevel, SystemOwner } from '@/lib/types'

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
const allTypes: OpportunityType[] = ['ugc', 'brand_deal', 'affiliate', 'partnership', 'other']
const priorities: PriorityLevel[] = ['high', 'medium', 'low']
const owners: SystemOwner[] = ['operator', 'lana', 'shared', 'system']

export default function OpportunitiesPage() {
  const mounted = useMounted()
  const { opportunities, updateOpportunityStatus, addOpportunity, updateOpportunity, removeOpportunity } = useLanaStore()
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | 'all'>('all')
  const [draft, setDraft] = useState({
    name: '',
    type: 'ugc' as OpportunityType,
    status: 'watching' as OpportunityStatus,
    fitScore: '0.75',
    estimatedValue: '',
    nextAction: '',
    notes: '',
    priority: 'medium' as PriorityLevel,
    owner: 'operator' as SystemOwner,
    dueDate: '',
  })

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
    <div className="px-10 py-10 max-w-[1080px] mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">
          Opportunity Surface
        </p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Pipeline</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {opportunities.length} total · {counts.ready ?? 0} ready for review · {counts.negotiating ?? 0} negotiating
        </p>
        <p className="text-[12px] text-lana-muted mt-2">
          Use this as the live monetization pipeline: keep next action, owner, priority, and due date current.
        </p>
      </div>

      <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5 mb-8">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.18em] uppercase mb-3">Add opportunity</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={draft.name} onChange={(e) => setDraft((v) => ({ ...v, name: e.target.value }))} placeholder="Opportunity name" className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40" />
          <input value={draft.estimatedValue} onChange={(e) => setDraft((v) => ({ ...v, estimatedValue: e.target.value }))} placeholder="Estimated value" className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40" />
        </div>
        <div className="grid grid-cols-5 gap-3 mb-3">
          <select value={draft.type} onChange={(e) => setDraft((v) => ({ ...v, type: e.target.value as OpportunityType }))} className="bg-surface-2 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
            {allTypes.map((type) => <option key={type} value={type}>{typeLabel[type]}</option>)}
          </select>
          <select value={draft.status} onChange={(e) => setDraft((v) => ({ ...v, status: e.target.value as OpportunityStatus }))} className="bg-surface-2 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
            {allStatuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
          </select>
          <select value={draft.priority} onChange={(e) => setDraft((v) => ({ ...v, priority: e.target.value as PriorityLevel }))} className="bg-surface-2 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
            {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select value={draft.owner} onChange={(e) => setDraft((v) => ({ ...v, owner: e.target.value as SystemOwner }))} className="bg-surface-2 border border-lana-border rounded-[2px] px-2 py-2 text-[12px] text-lana-muted font-mono outline-none focus:border-lana-gold/40">
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <input value={draft.fitScore} onChange={(e) => setDraft((v) => ({ ...v, fitScore: e.target.value }))} placeholder="0.00-1.00" className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40" />
        </div>
        <div className="grid grid-cols-[1fr_180px] gap-3 mb-3">
          <input value={draft.nextAction} onChange={(e) => setDraft((v) => ({ ...v, nextAction: e.target.value }))} placeholder="Next action" className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40" />
          <input type="date" value={draft.dueDate} onChange={(e) => setDraft((v) => ({ ...v, dueDate: e.target.value }))} className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-muted outline-none focus:border-lana-gold/40" />
        </div>
        <textarea value={draft.notes} onChange={(e) => setDraft((v) => ({ ...v, notes: e.target.value }))} placeholder="Notes and context" className="w-full min-h-[84px] bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-muted outline-none focus:border-lana-gold/40" />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              if (!draft.name.trim() || !draft.nextAction.trim()) return
              addOpportunity({
                id: `opp-${Date.now()}`,
                name: draft.name.trim(),
                type: draft.type,
                status: draft.status,
                fitScore: Math.max(0, Math.min(1, Number(draft.fitScore) || 0)),
                estimatedValue: draft.estimatedValue || undefined,
                nextAction: draft.nextAction.trim(),
                notes: draft.notes.trim(),
                priority: draft.priority,
                owner: draft.owner,
                dueDate: draft.dueDate || undefined,
                lastUpdatedAt: new Date().toISOString(),
              })
              setDraft({ name: '', type: 'ugc', status: 'watching', fitScore: '0.75', estimatedValue: '', nextAction: '', notes: '', priority: 'medium', owner: 'operator', dueDate: '' })
            }}
            className="rounded-[2px] bg-lana-gold/10 text-lana-gold px-3 py-2 text-[11px] font-mono tracking-[0.16em] uppercase"
          >
            Add opportunity
          </button>
        </div>
      </div>

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

      <div className="flex items-center gap-1 mb-6">
        <button onClick={() => setFilterStatus('all')} className={cn('font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all', filterStatus === 'all' ? 'bg-lana-gold/10 text-lana-gold' : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]')}>
          All
        </button>
        {allStatuses.filter((s) => (counts[s] ?? 0) > 0).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={cn('font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all', filterStatus === s ? 'bg-lana-gold/10 text-lana-gold' : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]')}>
            {statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((opp) => (
          <div key={opp.id} className={cn('border rounded-[3px] bg-surface-1 p-5', opp.status === 'ready' ? 'border-lana-gold/20' : 'border-lana-border')}>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-[56px] text-center">
                <p className="font-mono text-[22px] font-semibold text-lana-gold leading-none">
                  {Math.round(opp.fitScore * 100)}
                </p>
                <p className="font-mono text-[8px] text-lana-muted tracking-widest uppercase mt-0.5">
                  Fit
                </p>
                <div className="mt-2 h-[2px] bg-surface-3 rounded-full">
                  <div className="h-full bg-lana-gold rounded-full" style={{ width: `${opp.fitScore * 100}%` }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-[1.5fr_140px_130px_120px_140px_auto] gap-3 mb-2 items-start">
                  <input value={opp.name} onChange={(e) => updateOpportunity(opp.id, { name: e.target.value })} className="bg-transparent text-[15px] font-medium text-lana-text outline-none border-b border-transparent focus:border-lana-gold/40 pb-1" />
                  <select value={opp.status} onChange={(e) => updateOpportunityStatus(opp.id, e.target.value as OpportunityStatus)} className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40">
                    {allStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                  <select value={opp.type} onChange={(e) => updateOpportunity(opp.id, { type: e.target.value as OpportunityType })} className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40">
                    {allTypes.map((type) => <option key={type} value={type}>{typeLabel[type]}</option>)}
                  </select>
                  <select value={opp.priority ?? 'medium'} onChange={(e) => updateOpportunity(opp.id, { priority: e.target.value as PriorityLevel })} className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40">
                    {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                  <input type="date" value={opp.dueDate ?? ''} onChange={(e) => updateOpportunity(opp.id, { dueDate: e.target.value || undefined })} className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40" />
                  <button onClick={() => removeOpportunity(opp.id)} className="text-[11px] text-lana-red">Remove</button>
                </div>

                <div className="grid grid-cols-[1fr_140px] gap-3 mb-3">
                  <input value={opp.estimatedValue ?? ''} onChange={(e) => updateOpportunity(opp.id, { estimatedValue: e.target.value || undefined })} placeholder="Estimated value" className="bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40" />
                  <select value={opp.owner ?? 'operator'} onChange={(e) => updateOpportunity(opp.id, { owner: e.target.value as SystemOwner })} className="bg-surface-2 border border-lana-border rounded-[2px] text-[11px] text-lana-muted px-2 py-1 font-mono outline-none focus:border-lana-gold/40">
                    {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                  </select>
                </div>

                <input value={opp.nextAction} onChange={(e) => updateOpportunity(opp.id, { nextAction: e.target.value })} className="w-full bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-text outline-none focus:border-lana-gold/40 mb-3" />
                <textarea value={opp.notes} onChange={(e) => updateOpportunity(opp.id, { notes: e.target.value })} className="w-full min-h-[74px] bg-surface-2 border border-lana-border rounded-[2px] px-3 py-2 text-[12px] text-lana-muted outline-none focus:border-lana-gold/40" />

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className={cn('font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px]', statusColor[opp.status])}>{statusLabel[opp.status]}</span>
                  <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.04] text-lana-muted border border-lana-border">{typeLabel[opp.type]}</span>
                  <span className="font-mono text-[8px] tracking-widest uppercase text-lana-muted">owner · {opp.owner ?? 'operator'}</span>
                  {opp.lastUpdatedAt && <span className="font-mono text-[8px] tracking-widest uppercase text-lana-muted">updated · {opp.lastUpdatedAt.slice(0, 10)}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
