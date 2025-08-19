import * as React from "react"

export function Avatar({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-600 ${className || ''}`}>
      {children}
    </div>
  )
}

export function AvatarFallback({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <span className={`text-xs font-medium ${className || ''}`}>{children}</span>
}
