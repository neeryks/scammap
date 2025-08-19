import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AlertProps {
  children: ReactNode
  className?: string
  variant?: "default" | "destructive"
}

export function Alert({ children, className, variant = "default" }: AlertProps) {
  const variants = {
    default: "bg-slate-50 text-slate-900 border-slate-200",
    destructive: "bg-red-50 text-red-900 border-red-200"
  }
  
  return (
    <div className={cn(
      "relative w-full rounded-lg border p-4",
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDescription({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
      {children}
    </div>
  )
}
