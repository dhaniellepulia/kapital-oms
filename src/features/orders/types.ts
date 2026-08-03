export const ORDER_STATUSES = ['open', 'allocated', 'paid', 'completed'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface Order {
  id: string
  orderNumber: string
  itemName: string
  quantity: number
  capital: number
  sellingAmount: number
  grossProfit: number
  deliveryFee: number
  agentCommission: number
  middlemanCommission: number
  netProfit: number
  paymentDate: Date
  notes: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface OrderInput {
  itemName: string
  quantity: number
  capital: number
  sellingAmount: number
  grossProfit: number
  deliveryFee: number
  paymentDate: Date
  notes: string
  status?: OrderStatus
}
