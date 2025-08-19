"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { account } from '@/lib/appwrite.client'

type User = { $id: string; email: string; name?: string } | null

interface AuthContextType {
  user: User
  loading: boolean
  refetch: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: async () => {},
  logout: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      const userData = await account.get()
      setUser({ 
        $id: userData.$id, 
        email: userData.email || '', 
        name: userData.name 
      })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await account.deleteSession('current')
    } catch {}
  try { await fetch('/api/session/clear', { method: 'POST' }) } catch {}
    setUser(null)
  }

  useEffect(() => {
    // Only fetch user on client side
    if (typeof window !== 'undefined') {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      refetch: fetchUser, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
