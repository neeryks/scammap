"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { account } from '@/lib/appwrite.client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

type Report = {
  id: string
  created_at: string
  venue_name?: string
  city?: string
  category: string
  scam_meter_score: number
}

export default function MyReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchReports()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  async function fetchReports() {
    try {
      const jwt = await account.createJWT()
      const res = await fetch(`/api/reports?mine=true`, {
        headers: { Authorization: `Bearer ${jwt.jwt}` }
      })
      const data = await res.json()
      if (res.ok) setReports(data.items)
      else setError(data.error || 'Failed to load reports')
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to load reports'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function withdraw(id: string) {
    if (!confirm('Withdraw this report?')) return
    try {
      const jwt = await account.createJWT()
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt.jwt}` } })
      if (res.ok) setReports(rs => rs.filter(r => r.id !== id))
      else {
        const data = await res.json()
        alert(data.error || 'Failed to withdraw')
      }
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to withdraw'
      alert(msg)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-2">My Reports</h1>
        <p className="text-slate-600 mb-4">Sign in to manage your reports.</p>
        <Link href="/auth/login"><Button>Login</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Reports</h1>
        <Link href="/report"><Button>New Report</Button></Link>
      </div>
      {reports.length === 0 ? (
        <p className="text-slate-600">No reports yet.</p>
      ) : (
        <div className="divide-y rounded-md border bg-white">
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{r.venue_name || 'Unnamed venue'} · <span className="text-slate-500">{r.city || 'Unknown'}</span></div>
                <div className="text-sm text-slate-500">{new Date(r.created_at).toLocaleString()} • {r.category} • Risk {r.scam_meter_score}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/incidents/${r.id}`} className="text-sm text-slate-700 hover:underline">View</Link>
                <button className="text-sm text-red-600 hover:underline" onClick={() => withdraw(r.id)}>Withdraw</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
