import { collection } from 'firebase/firestore'

import { db } from '@/lib/firebase'

export const usersCol = collection(db, 'users')
export const ordersCol = collection(db, 'orders')
export const investmentsCol = collection(db, 'investments')
export const settingsCol = collection(db, 'settings')
