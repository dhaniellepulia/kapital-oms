import type { InvestorFigures } from '@/lib/calculations'
import type { Order } from '@/features/orders/types'

export interface Investment {
  orderId: string
  userId: string
  investorName: string
  investorEmail?: string
  investedCapital: number
  createdAt: Date
  updatedAt: Date
}

export interface InvestorOrder {
  investment: Investment
  order: Order
}

export interface InvestmentWithFigures {
  investment: Investment
  figures: InvestorFigures
}
