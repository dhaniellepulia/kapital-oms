export const USER_ROLES = ['admin', 'user'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
