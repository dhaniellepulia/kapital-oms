export interface AppSettings {
  agentCommissionRate: number
  middlemanCommissionRate: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  agentCommissionRate: 0.1,
  middlemanCommissionRate: 0.1,
}
