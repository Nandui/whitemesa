'use client'
import { useMounted } from '@/lib/hooks'
import { useLanaStore } from '@/lib/store'

export default function DossierPage() {
  const mounted = useMounted()
  const { dossier } = useLanaStore()

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
    <div className="px-10 py-10 max-w-[1100px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="border-b border-lana-border pb-8 mb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[9px] text-lana-gold tracking-[0.22em] uppercase mb-2">Dossier</p>
            <h1 className="text-3xl font-semibold text-lana-text tracking-tight mb-1">{dossier.name}</h1>
            <p className="text-[14px] text-lana-muted">{dossier.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 border border-lana-gold/20 rounded-[3px] px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-lana-gold animate-pulse-slow" />
              <span className="font-mono text-[10px] text-lana-gold tracking-widest uppercase">
                {dossier.currentMode}
              </span>
            </div>
            <span className="font-mono text-[9px] text-lana-muted tracking-widest">v{dossier.version}</span>
          </div>
        </div>
      </div>

      {/* Identity summary */}
      <div className="mb-10">
        <SectionLabel>Identity Summary</SectionLabel>
        <p className="text-[15px] text-lana-text-2 leading-[1.75] max-w-[700px]">
          {dossier.identitySummary}
        </p>
      </div>

      {/* Three-col: Traits, Goals, Boundaries */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <Panel label="Core Traits">
          <ul className="space-y-2.5">
            {dossier.traits.map((trait) => (
              <li key={trait} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-lana-gold flex-shrink-0" />
                <span className="text-[13px] text-lana-text-2">{trait}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel label="Strategic Goals">
          <ul className="space-y-3">
            {dossier.goals.map((goal, i) => (
              <li key={i} className="text-[13px] text-lana-text-2 leading-snug pl-3 border-l border-lana-border">
                {goal}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel label="Boundaries">
          <ul className="space-y-3">
            {dossier.boundaries.map((boundary, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-lana-red flex-shrink-0 mt-1.5" />
                <span className="text-[13px] text-lana-text-2 leading-snug">{boundary}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Public persona */}
      <div className="mb-10">
        <SectionLabel>Public Persona</SectionLabel>
        <div className="border border-lana-border rounded-[3px] bg-surface-1 p-6 max-w-[700px]">
          <p className="text-[14px] text-lana-text-2 leading-[1.75] italic">
            &ldquo;{dossier.publicPersona}&rdquo;
          </p>
        </div>
      </div>

      {/* Operator notes */}
      <div>
        <SectionLabel>Operator Notes</SectionLabel>
        <div className="space-y-2">
          {dossier.operatorNotes.map((note, i) => (
            <div key={i} className="flex items-start gap-4 border border-lana-border rounded-[3px] bg-surface-1 px-5 py-3">
              <span className="font-mono text-[9px] text-lana-muted mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-[13px] text-lana-text-2">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] text-lana-muted tracking-[0.2em] uppercase mb-4">{children}</p>
  )
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-lana-border rounded-[3px] bg-surface-1 p-5">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  )
}
