"use client"
import { useState } from 'react'
import { account, OAuthProvider } from '@/lib/appwrite.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    try {
      setLoading(true)
      setError('')
      
      // Create OAuth session with Google
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`, // success URL
        `${window.location.origin}/auth/login?error=oauth_failed` // failure URL
      )
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Google sign-in failed'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-600 transition-colors">
            ScamMapper
          </Link>
          <p className="text-slate-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to ScamMapper
          </Link>
        </div>
      </div>
    </div>
  )
}