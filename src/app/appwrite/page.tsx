"use client"
import { useState } from 'react'

export default function AppwriteVerifyPage() {
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function sendPing() {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/appwrite/ping', { cache: 'no-store' })
      const json = await res.json()
      if (json.ok) {
        setStatus('Ping OK. Your web platform should now be verified.')
      } else {
        setStatus(`Ping failed: ${json.status || ''} ${json.error || JSON.stringify(json.data)}`)
      }
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e)
      setStatus(`Ping error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Verify Appwrite Web Platform</h1>
      <p className="text-slate-600">This will call the Appwrite health endpoint with your project header from this origin.</p>
      <button
        onClick={sendPing}
        disabled={loading}
        className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send a ping'}
      </button>
      {!!status && <p className="text-sm text-slate-700">{status}</p>}
  <div className="text-xs text-slate-500">Ping uses a server key for verification.</div>
    </div>
  )
}
