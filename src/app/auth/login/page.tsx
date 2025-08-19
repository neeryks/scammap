"use client"
import { useState } from 'react'
import { account, ID } from '@/lib/appwrite.client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { refetch } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (isRegistering) {
        // Register new user
        await account.create(ID.unique(), email, password, name)
        // Try to create session immediately
        try { 
          await account.createEmailPasswordSession(email, password)
          // Set HttpOnly cookie for middleware
          try {
            const jwt = await account.createJWT()
            await fetch('/api/session/set', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jwt: jwt.jwt }) })
          } catch {}
          await refetch() // Update auth context immediately
          router.push('/account')
        } catch {
          // If session creation fails (likely due to email verification), send verification
          try { await account.createVerification(`${window.location.origin}/auth/verify`) } catch {}
          setError('Account created! Verification email sent. Please verify, then sign in.')
        }
      } else {
        // Sign in existing user
        try { await account.deleteSession('current') } catch {}
        await account.createEmailPasswordSession(email, password)
        // Set HttpOnly cookie for middleware
        try {
          const jwt = await account.createJWT()
          await fetch('/api/session/set', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jwt: jwt.jwt }) })
        } catch {}
        await refetch() // Update auth context immediately
        router.push('/account')
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? (isRegistering ? 'Registration failed' : 'Login failed')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {isRegistering ? 'Create Account' : 'Sign In'}
      </h1>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {isRegistering && (
          <input 
            className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
          />
        )}
        <input 
          className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <input 
          className="w-full border border-slate-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
          minLength={8}
        />
        
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
        
        <button 
          className="w-full bg-slate-900 text-white py-3 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50" 
          type="submit"
          disabled={loading}
        >
          {loading ? '...' : isRegistering ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          className="text-slate-600 hover:text-slate-900 underline" 
          onClick={() => {
            setIsRegistering(!isRegistering)
            setError('')
            setName('')
            setEmail('')
            setPassword('')
          }}
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  )
}