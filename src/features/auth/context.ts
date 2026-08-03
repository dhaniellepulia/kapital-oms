import { createContext } from 'react'
import type { User } from 'firebase/auth'

import type { UserProfile } from '@/features/users/types'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  isInitializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
