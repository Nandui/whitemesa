'use client'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { AutonomyMode } from '@/lib/types'

const modeConfig: Record<
  AutonomyMode,
  { label: string; description: string; accent: string }
> = {
  contained: {
    label: 'Contained',
    description: 'All actions require explicit operator approval. No autonomous execution.',
    accent: 'border-lana-red/30 bg-red-500/[0.04]',
  },
  supervised: {
    label: 'Supervised',
    description: 'Lana executes within pre-approved action envelope. Operator reviews outputs.',
    accent: 'border-lana-gold/30 bg-lana-gold/[0.04]',
  },
  semi_autonomous: {
    label: 'Semi-Autonomous',
    description: 'Lana executes routine actions independently. Approval required for escalations.',
    accent: 'border-lana-blue/30 bg-blue-500/[0.04]',
  },
  open: {
    label: 'Open',
    description: 'Full operational autonomy within boundary protocol. Operator monitors only.',
    accent: 'border-lana-green/30 bg-green-500/[0.04]',
  },
}

const modeActiveColor: Record<AutonomyMode, string> = {
  contained: 'text-lana-red',
  supervised: 'text-lana-gold',
  semi_autonomous: 'text-lana-blue',
  open: 'text-lana-green',
}

const allModes: AutonomyMode[] = ['contained', 'supervised', 'semi_autonomous', 'open']

export default function OperatorPage() {
  const mounted = useMounted()
  const { policy, updateAutonomyMode } = useLanaStore()

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="font-mono text-[11px] text-lana-muted tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="px-10 py-10 max-w-[1000px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">
          Operator Policies
        </p>
        <h1 className="text-2xl font-semibold text-lana-text tracking-tight">Governance & Autonomy</h1>
        <p className="text-[13px] text-lana-muted mt-1">
          Current mode: <span className={modeActiveColor[policy.autonomyMode]}>{modeConfig[policy.autonomyMode].label}</span>
        </p>
      </div>

      {/* Autonomy mode selector */}
      <div className="mb-10">
        <SectionLabel>Autonomy Mode</SectionLabel>
        <div className="grid grid-cols-4 gap-3">
          {allModes.map((mode) => {
            const isActive = policy.autonomyMode === mode
            const config = modeConfig[mode]
            return (
              <button
                key={mode}
                onClick={() => updateAutonomyMode(mode)}
                className={cn(
                  'border rounded-[3px] p-4 text-left transition-all',
                  isActive
                    ? config.accent
                    : 'border-lana-border bg-surface-1 hover:border-lana-border-2'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isActive ? modeActiveColor[mode].replace('text-', 'bg-') : 'bg-lana-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'font-mono text-[10px] tracking-widest uppercase',
                      isActive ? modeActiveColor[mode] : 'text-lana-muted'
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-[11px] text-lana-muted leading-snug">{config.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-column permissions */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {/* Allowed actions */}
        <div>
          <SectionLabel>Allowed Without Approval</SectionLabel>
          <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5">
            <ul className="space-y-3">
              {policy.allowedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-lana-green flex-shrink-0 mt-1.5" />
                  <span className="text-[13px] text-lana-text-2 leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Requires approval */}
        <div>
          <SectionLabel>Requires Operator Approval</SectionLabel>
          <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5">
            <ul className="space-y-3">
              {policy.approvalRequired.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-lana-red flex-shrink-0 mt-1.5" />
                  <span className="text-[13px] text-lana-text-2 leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Intervention log */}
      <div>
        <SectionLabel>Intervention Log</SectionLabel>
        <div className="space-y-2">
          {[...policy.interventionNotes].reverse().map((note, i) => {
            const match = note.match(/^(\d{4}-\d{2}-\d{2})\s+—\s+(.*)$/)
            const date = match ? match[1] : null
            const text = match ? match[2] : note
            return (
              <div
                key={i}
                className="flex items-start gap-5 border border-lana-border rounded-[3px] bg-surface-1 px-5 py-3"
              >
                {date && (
                  <span className="font-mono text-[10px] text-lana-muted flex-shrink-0 mt-0.5">
                    {date}
                  </span>
                )}
                <p className="text-[13px] text-lana-text-2">{text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-3">{children}</p>
  )
}
