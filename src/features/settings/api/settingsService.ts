import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

import { settingsCol } from '@/lib/collections'
import { DEFAULT_SETTINGS, type AppSettings } from '../types'

function isValidRate(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

export async function getSettings(): Promise<AppSettings> {
  const snapshot = await getDoc(doc(settingsCol, 'app'))
  if (!snapshot.exists()) return DEFAULT_SETTINGS

  const data = snapshot.data()
  return {
    agentCommissionRate: isValidRate(data.agentCommissionRate)
      ? data.agentCommissionRate
      : DEFAULT_SETTINGS.agentCommissionRate,
    middlemanCommissionRate: isValidRate(data.middlemanCommissionRate)
      ? data.middlemanCommissionRate
      : DEFAULT_SETTINGS.middlemanCommissionRate,
  }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const { agentCommissionRate, middlemanCommissionRate } = patch
  if (agentCommissionRate === undefined && middlemanCommissionRate === undefined) {
    throw new Error('Provide at least one commission rate')
  }

  const rates = {
    agentCommissionRate: agentCommissionRate ?? DEFAULT_SETTINGS.agentCommissionRate,
    middlemanCommissionRate:
      middlemanCommissionRate ?? DEFAULT_SETTINGS.middlemanCommissionRate,
  }

  for (const [key, value] of Object.entries(rates)) {
    if (!isValidRate(value)) {
      throw new Error(`${key} must be between 0 and 1`)
    }
  }

  await setDoc(doc(settingsCol, 'app'), { ...rates, updatedAt: Timestamp.now() }, { merge: true })
}
