'use client'
import { Sidebar } from './Sidebar'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <Sidebar />
      <main className="ml-[256px] flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
