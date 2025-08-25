'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => setOpen(false)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(!open)}
        aria-haspopup="menu" 
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>
      
      {open && (
        <div 
          role="menu" 
          className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg z-50"
        >
          <div className="p-1">
            <Link 
              href="/map" 
              onClick={closeMenu}
              className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors py-2 px-3 rounded-md"
            >
              Map
            </Link>
            <Link 
              href="/incidents" 
              onClick={closeMenu}
              className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors py-2 px-3 rounded-md"
            >
              Incidents
            </Link>
            <hr className="my-1" />
            <Link href="/report" onClick={closeMenu}>
              <Button className="w-full mt-2" size="sm">
                Report Incident
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
