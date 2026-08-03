import { doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

import { usersCol } from '@/lib/collections'
import type { UserProfile, UserRole } from '../types'

export interface CreateUserProfileInput {
  name: string
  email: string
  role: UserRole
}

export async function createUserProfile(uid: string, input: CreateUserProfileInput): Promise<void> {
  const now = Timestamp.now()
  await setDoc(doc(usersCol, uid), {
    name: input.name,
    email: input.email,
    role: input.role,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(query(usersCol, orderBy('createdAt', 'asc')))
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      uid: d.id,
      name: data.name as string,
      email: data.email as string,
      role: data.role as UserRole,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    }
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(usersCol, uid))
  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    uid,
    name: data.name as string,
    email: data.email as string,
    role: data.role as UserRole,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(usersCol, uid), { role, updatedAt: Timestamp.now() })
}

export async function updateUserProfile(
  uid: string,
  patch: { name?: string },
): Promise<void> {
  const snapshot = await getDoc(doc(usersCol, uid))
  if (!snapshot.exists()) throw new Error('Profile not found')

  await updateDoc(doc(usersCol, uid), {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    updatedAt: Timestamp.now(),
  })
}
