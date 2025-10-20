'use client'

import * as React from 'react'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 ${className || ''}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`mb-4 ${className || ''}`}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-2xl font-bold ${className || ''}`}>
      {children}
    </h2>
  )
}
