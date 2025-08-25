"use client"
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { account } from '@/lib/appwrite.client'

function AuthCallbackContent() {
  const router = useRouter()
  const { refetch } = useAuth()

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the current session (should exist after OAuth redirect)
        const session = await account.getSession('current')
        
        if (session) {
          // Set HttpOnly cookie for middleware
          try {
            const jwt = await account.createJWT()
            await fetch('/api/session/set', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jwt: jwt.jwt })
            })
          } catch (error) {
            console.log('JWT cookie setting failed:', error)
          }
          
          // Update auth context
          await refetch()
          
          // Redirect to account page
          router.push('/account')
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        // Redirect back to login with error
        router.push('/auth/login?error=oauth_failed')
      }
    }

    handleCallback()
  }, [router, refetch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing sign-in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
