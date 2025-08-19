"use client"
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite.client'

function VerifyBody() {
  const sp = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    const userId = sp.get('userId') || sp.get('userId[]') || ''
    const secret = sp.get('secret') || sp.get('secret[]') || ''
    if (!userId || !secret) {
      setStatus('Missing verification parameters.')
      return
    }
    ;(async () => {
      try {
        await account.updateVerification(userId, secret)
        setStatus('Email verified. Redirecting…')
        setTimeout(() => router.push('/auth/login'), 1200)
      } catch (e) {
        const msg = (e as Error)?.message || 'Verification failed.'
        setStatus(msg)
      }
    })()
  }, [sp, router])

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
      <p className="text-slate-600">{status || 'Verifying…'}</p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6">Verifying…</div>}>
      <VerifyBody />
    </Suspense>
  )
}
