'use client'

import { ReactNode } from 'react'

export function LayoutProvider({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-netflix-dark text-white">
      {children}
    </div>
  )
}
