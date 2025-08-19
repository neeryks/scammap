"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

export default function AccountMenu() {
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await logout()
    setOpen(false)
    window.location.href = '/'
  }

  function handleAccountClick() {
    if (user) {
      setOpen(o => !o)
    } else {
      // Navigate to login/register page
      window.location.href = '/auth/login'
    }
  }

  const initials = user?.name ? user.name[0]?.toUpperCase() : user?.email ? user.email[0]?.toUpperCase() : '?'

  return (
    <div className="relative">
      <button 
        className="inline-flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors" 
        onClick={handleAccountClick} 
        aria-haspopup="menu" 
        aria-expanded={open}
        disabled={loading}
      >
        <Avatar className={`h-8 w-8 ${user ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-600'}`}>
          <AvatarFallback>
            {loading ? '...' : initials}
          </AvatarFallback>
        </Avatar>
      </button>
      
      {user && open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg z-50">
          <div className="px-3 py-2 border-b text-sm">
            <div className="font-medium text-slate-900">{user.name || user.email}</div>
            <div className="text-slate-500 text-xs">{user.email}</div>
          </div>
          <div className="p-1">
            <Link href="/account" className="block rounded px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <Link href="/account/reports" className="block rounded px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
              My Reports
            </Link>
            <Link href="/report" className="block rounded px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
              Report an Incident
            </Link>
            <hr className="my-1" />
            <button onClick={handleLogout} className="w-full text-left rounded px-3 py-2 text-sm hover:bg-slate-50 text-red-600">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
