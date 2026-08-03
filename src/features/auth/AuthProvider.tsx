import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'

import { getUserProfile, createUserProfile } from '@/features/users/api/usersService'
import { signInWithEmail, signOutUser, signUpWithEmail, subscribeToAuth } from './api/authService'
import { AuthContext, type AuthContextValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        void getUserProfile(firebaseUser.uid)
          .then(setProfile)
          .catch(() => setProfile(null))
      } else {
        setProfile(null)
      }
      setIsInitializing(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const firebaseUser = await signInWithEmail(email, password)
    setUser(firebaseUser)
    setProfile(await getUserProfile(firebaseUser.uid))
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const firebaseUser = await signUpWithEmail(email, password)
    try {
      await createUserProfile(firebaseUser.uid, { name, email, role: 'user' })
    } catch (error) {
      await firebaseUser.delete()
      throw error
    }
    setUser(firebaseUser)
    setProfile(await getUserProfile(firebaseUser.uid))
  }, [])

  const signOut = useCallback(async () => {
    await signOutUser()
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    setProfile(await getUserProfile(user.uid))
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, isInitializing, signIn, signUp, signOut, refreshProfile }),
    [user, profile, isInitializing, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
