"use client"
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Command({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-md border bg-white text-slate-950 shadow-sm', className)} {...props} />
}

export function CommandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border-b px-3">
      <input
        {...props}
        className={cn('flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50', props.className)}
      />
    </div>
  )
}

export function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('max-h-72 overflow-y-auto p-1', className)} {...props} />
}

export function CommandGroup({ className, heading, ...props }: React.ComponentProps<'div'> & { heading?: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      {heading && <div className="px-2 pb-1 pt-2 text-xs font-medium text-slate-500 uppercase tracking-wide">{heading}</div>}
      <div className={cn('space-y-1', className)} {...props} />
    </div>
  )
}

export function CommandItem({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn('w-full text-left text-sm px-2 py-2 rounded-md hover:bg-slate-100 focus:bg-slate-100 focus:outline-none flex items-center gap-2', className)}
      {...props}
    />
  )
}

export function CommandEmpty({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-6 text-sm text-slate-500 text-center">{children}</div>
}
