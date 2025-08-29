"use client"
import { useState } from 'react'
import { account, OAuthProvider } from '@/lib/appwrite.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      
      {/* Navigation Header */}
      <header className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to ScamMapper</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Brand & Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome to ScamMapper
              </h1>
              <p className="text-slate-600 text-lg">
                Sign in to access your account and help protect your community
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-xl text-slate-900">Sign In</CardTitle>
              <CardDescription className="text-slate-600">
                Use your Google account to continue securely
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Google OAuth Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                size="lg"
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                variant="outline"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold">
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </Button>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Sign-in failed</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="text-center pt-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  By signing in, you agree to our terms and privacy policy. 
                  Your data is secured and protected.
                </p>
              </div>
              
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Secure Authentication
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Privacy Protected
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-slate-500">
          Need help? <Link href="/legal" className="text-slate-700 hover:text-slate-900 font-medium">Contact Support</Link>
        </p>
      </footer>
      
    </div>
  )
}