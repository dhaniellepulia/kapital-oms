import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'

import { getUserProfile, createUserProfile } from '@/features/users/api/usersService'
import { signInWithEmail, signOutUser, signUpWithEmail, subscribeToAuth } from './api/authService'
import { AuthContext, type AuthContextValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        setIsProfileLoading(true)
        void getUserProfile(firebaseUser.uid)
          .then(setProfile)
          .catch(() => setProfile(null))
          .finally(() => setIsProfileLoading(false))
      } else {
        setProfile(null)
        setIsProfileLoading(false)
      }
      setIsInitializing(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const firebaseUser = await signInWithEmail(email, password)
    setUser(firebaseUser)
    setIsProfileLoading(true)
    try {
      setProfile(await getUserProfile(firebaseUser.uid))
    } finally {
      setIsProfileLoading(false)
    }
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
    setIsProfileLoading(true)
    try {
      setProfile(await getUserProfile(firebaseUser.uid))
    } finally {
      setIsProfileLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await signOutUser()
    setUser(null)
    setProfile(null)
    setIsProfileLoading(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    setIsProfileLoading(true)
    try {
      setProfile(await getUserProfile(user.uid))
    } finally {
      setIsProfileLoading(false)
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isInitializing,
      isProfileLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, isInitializing, isProfileLoading, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
