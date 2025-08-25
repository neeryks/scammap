'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  value: string
  label?: string
  className?: string
}

export default function CopyButton({ value, label = 'Copy', className }: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // no-op
    }
  }

  return (
    <Button
      type="button"
      onClick={onCopy}
      variant="ghost"
      className={['h-8 px-2 text-xs', className].filter(Boolean).join(' ')}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? 'Copied' : label}
    </Button>
  )
}
