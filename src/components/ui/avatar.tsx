import * as React from "react"
import Image from "next/image"

export function Avatar({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-600 ${className || ''}`}>
      {children}
    </div>
  )
}

type AvatarImageProps = {
  src?: string
  alt?: string
  className?: string
  width?: number
  height?: number
}

export function AvatarImage({ src, alt = 'Avatar', className, width = 32, height = 32 }: AvatarImageProps) {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`h-full w-full object-cover ${className || ''}`}
    />
  )
}

export function AvatarFallback({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <span className={`text-xs font-medium ${className || ''}`}>{children}</span>
}
