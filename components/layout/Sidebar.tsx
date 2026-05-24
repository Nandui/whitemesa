'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UserCircle, Map, Brain, RefreshCw, TrendingUp, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  {
    label: 'Systems',
    items: [
      { href: '/', label: 'Command Deck', icon: LayoutDashboard },
      { href: '/dossier', label: 'Dossier', icon: UserCircle },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/roadmap', label: 'Roadmap', icon: Map },
      { href: '/memory', label: 'Memory Lattice', icon: Brain },
      { href: '/heartbeats', label: 'Loops', icon: RefreshCw },
    ],
  },
  {
    label: 'Monetization',
    items: [{ href: '/opportunities', label: 'Opportunity Surface', icon: TrendingUp }],
  },
  {
    label: 'Governance',
    items: [{ href: '/operator', label: 'Operator Policies', icon: ShieldCheck }],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[256px] bg-surface-0 border-r border-lana-border flex flex-col z-20">
      {/* Logomark */}
      <div className="px-6 pt-7 pb-6 border-b border-lana-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-lana-gold animate-pulse-slow" />
          <span className="font-mono text-[9px] text-lana-gold tracking-[0.2em] uppercase">Control Center</span>
        </div>
        <h1 className="font-sans text-[17px] font-semibold text-lana-text tracking-tight leading-tight">
          Lana Hayes
        </h1>
        <p className="font-mono text-[9px] text-lana-muted tracking-[0.12em] mt-1 uppercase">
          Build v0.4 · Synthetic
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-7">
            <p className="font-mono text-[9px] text-lana-muted tracking-[0.18em] uppercase px-3 mb-2">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-[9px] rounded-[3px] mb-0.5 transition-all duration-150 group',
                    isActive
                      ? 'bg-lana-gold/10 text-lana-gold'
                      : 'text-lana-muted hover:text-lana-text-2 hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    size={13}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="flex-shrink-0"
                  />
                  <span className="text-[13px] font-sans font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-[3px] h-3.5 bg-lana-gold rounded-full opacity-80" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-lana-border">
        <p className="font-mono text-[9px] text-lana-muted tracking-[0.12em] leading-[1.8] uppercase">
          Mode: Supervised
          <br />
          Operator Access
        </p>
      </div>
    </aside>
  )
}
