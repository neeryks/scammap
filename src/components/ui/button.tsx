import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  href?: string
}

export function Button({ 
  children, 
  variant = "default", 
  size = "default", 
  className, 
  disabled,
  onClick,
  type = "button",
  href,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8"
  }
  
  const buttonClass = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  )
  
  if (href) {
    return (
      <a href={href} className={buttonClass} {...props}>
        {children}
      </a>
    )
  }
  
  return (
    <button 
      type={type}
      className={buttonClass} 
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
