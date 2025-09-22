import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, onAuthStateChange } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Set a timeout to ensure we don't hang indefinitely
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('Auth initialization timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
        if (isMounted) {
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    let subscription: any = null
    try {
      const { data } = onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session)
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          clearTimeout(timeoutId)
        }
        
        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User successfully signed in:', session?.user)
        } else if (event === 'SIGNED_UP') {
          console.log('User successfully signed up:', session?.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      })
      subscription = data.subscription
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      if (isMounted) {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}