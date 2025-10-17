import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <main className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-hidden ${className}`}>
      {children}
    </main>
  )
}

