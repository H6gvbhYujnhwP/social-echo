'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui/Button'

interface CopyableProps {
  text: string
  children: React.ReactNode
  className?: string
}

export function Copyable({ text, children, className = '' }: CopyableProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {children}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  )
}
