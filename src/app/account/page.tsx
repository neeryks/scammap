"use client"
import { useState } from 'react'
import Link from 'next/link'
import { account } from '@/lib/appwrite.client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function AccountDashboard() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string>('')

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Your account</h1>
        <p className="text-slate-600 mb-4">You need to sign in to view your dashboard.</p>
        <Link href="/auth/login"><Button>Go to login</Button></Link>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    )
  }

  async function resendVerification() {
    try { await account.createVerification(`${window.location.origin}/auth/verify`) } catch {}
    alert('Verification email sent. Please check your inbox.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-slate-600">Signed in as {user.name || user.email}</p>
        {/* Note: emailVerification status check removed as it's not reliably available */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/report" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
          <div className="text-sm text-slate-500">Quick action</div>
          <div className="text-lg font-semibold">Report an Incident</div>
        </Link>
        <Link href="/account/reports" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
          <div className="text-sm text-slate-500">Manage</div>
          <div className="text-lg font-semibold">My Reports</div>
        </Link>
        <Link href="/incidents" className="rounded-lg border bg-white p-4 shadow-sm hover:shadow">
          <div className="text-sm text-slate-500">Explore</div>
          <div className="text-lg font-semibold">All Incidents</div>
        </Link>
      </div>
    </div>
  )
}
