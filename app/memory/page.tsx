'use client'
import { useState } from 'react'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { MemoryType } from '@/lib/types'

const typeColor: Record<MemoryType, string> = {
  durable: 'text-lana-gold bg-lana-gold/10',
  reflection: 'text-lana-blue bg-blue-500/10',
  research: 'text-lana-mint bg-green-500/10',
  synthesis: 'text-lana-purple bg-purple-500/10',
}
const typeLabel: Record<MemoryType, string> = {
  durable: 'Durable',
  reflection: 'Reflection',
  research: 'Research',
  synthesis: 'Synthesis',
}

const allTypes: MemoryType[] = ['durable', 'reflection', 'research', 'synthesis']

export default function MemoryPage() {
  const mounted = useMounted()
  const { memories } = useLanaStore()
  const [activeType, setActiveType] = useState<MemoryType | 'all'>('all')
  const [search, setSearch] = useState('')

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  const filtered = memories.filter((m) => {
    const matchType = activeType === 'all' || m.type === activeType
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
    return matchType && matchSearch
  })

  const counts: Record<string, number> = {
    all: memories.length,
    ...Object.fromEntries(allTypes.map((t) => [t, memories.filter((m) => m.type === t).length])),
  }

  return (
    <div className="px-10 py-10 max-w-[1100px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Memory Lattice</p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Memory & Reflection</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          {memories.length} entries · durable knowledge, reflections, research, synthesis
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveType('all')}
            className={cn(
              'font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all',
              activeType === 'all'
                ? 'bg-lana-gold/10 text-lana-gold'
                : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]'
            )}
          >
            All <span className="ml-1 opacity-60">{counts.all}</span>
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                'font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-[2px] transition-all',
                activeType === t
                  ? 'bg-lana-gold/10 text-lana-gold'
                  : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]'
              )}
            >
              {typeLabel[t]} <span className="ml-1 opacity-60">{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <input
            type="text"
            placeholder="Search memory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-1 border border-lana-border rounded-[2px] text-[12px] text-lana-text-2 placeholder:text-lana-muted px-3 py-1.5 font-sans outline-none focus:border-lana-gold/40 w-[220px]"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-[11px] text-lana-muted tracking-widest uppercase">No entries found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="border border-lana-border rounded-[3px] bg-surface-1 p-5 flex flex-col gap-3 hover:border-lana-border-2 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    'font-mono text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-[2px] flex-shrink-0',
                    typeColor[entry.type]
                  )}
                >
                  {typeLabel[entry.type]}
                </span>
                <span className="font-mono text-[10px] text-lana-muted flex-shrink-0">
                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                </span>
              </div>

              <h3 className="text-[14px] font-medium text-lana-text leading-snug">{entry.title}</h3>
              <p className="text-[12px] text-lana-muted leading-relaxed flex-1">{entry.summary}</p>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-lana-border">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[8px] text-lana-muted tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.04] border border-lana-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
