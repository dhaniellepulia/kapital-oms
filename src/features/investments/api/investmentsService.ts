import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'

import { investmentRatio, type InvestorFigures } from '@/lib/calculations'
import { investmentsCol, ordersCol, usersCol } from '@/lib/collections'
import { getOrdersByIds } from '@/features/orders/api/ordersService'
import type { Order } from '@/features/orders/types'
import type { Investment, InvestorOrder } from '../types'

export function investmentDocId(orderId: string, userId: string): string {
  return `${orderId}_${userId}`
}

function toInvestment(data: DocumentData): Investment {
  return {
    orderId: data.orderId as string,
    userId: data.userId as string,
    investorName: data.investorName as string,
    investorEmail: data.investorEmail as string | undefined,
    investedCapital: data.investedCapital as number,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  }
}

export async function getAllInvestments(): Promise<Investment[]> {
  const snapshot = await getDocs(query(investmentsCol, orderBy('createdAt', 'asc')))
  return snapshot.docs.map((d) => toInvestment(d.data()))
}

export async function getInvestmentsByOrder(orderId: string): Promise<Investment[]> {
  const snapshot = await getDocs(
    query(investmentsCol, where('orderId', '==', orderId), orderBy('createdAt', 'asc')),
  )
  return snapshot.docs.map((d) => toInvestment(d.data()))
}

export async function getInvestmentsByUser(userId: string): Promise<Investment[]> {
  const snapshot = await getDocs(
    query(investmentsCol, where('userId', '==', userId), orderBy('createdAt', 'desc')),
  )
  return snapshot.docs.map((d) => toInvestment(d.data()))
}

async function syncAllocationStatus(orderId: string): Promise<void> {
  const orderSnapshot = await getDoc(doc(ordersCol, orderId))
  if (!orderSnapshot.exists()) return
  const data = orderSnapshot.data()
  const totalCapital = (data.capital as number) * (data.quantity as number)
  const investments = await getInvestmentsByOrder(orderId)
  const totalAssigned = investments.reduce((sum, inv) => sum + inv.investedCapital, 0)
  const fullyFunded = totalCapital > 0 && totalAssigned >= totalCapital
  const status = data.status as string

  if (status === 'open' && fullyFunded) {
    await updateDoc(doc(ordersCol, orderId), { status: 'allocated', updatedAt: Timestamp.now() })
  } else if (status === 'allocated' && !fullyFunded) {
    await updateDoc(doc(ordersCol, orderId), { status: 'open', updatedAt: Timestamp.now() })
  }
}

export async function assignInvestor(
  orderId: string,
  userId: string,
  investedCapital: number,
): Promise<void> {
  const [orderSnapshot, userSnapshot] = await Promise.all([
    getDoc(doc(ordersCol, orderId)),
    getDoc(doc(usersCol, userId)),
  ])
  if (!orderSnapshot.exists()) throw new Error('Order not found')
  if (!userSnapshot.exists()) throw new Error('Investor not found')

  const ref = doc(investmentsCol, investmentDocId(orderId, userId))
  const existing = await getDoc(ref)
  const now = Timestamp.now()
  const data = {
    orderId,
    userId,
    investorName: userSnapshot.data().name as string,
    investorEmail: userSnapshot.data().email as string,
    investedCapital,
    updatedAt: now,
  }

  if (existing.exists()) {
    await updateDoc(ref, data)
  } else {
    await setDoc(ref, { ...data, createdAt: now })
  }

  await syncAllocationStatus(orderId)
}

const GUEST_USER_PREFIX = 'guest_'

export function isGuestInvestment(investment: Investment): boolean {
  return investment.userId.startsWith(GUEST_USER_PREFIX)
}

export async function assignGuestInvestor(
  orderId: string,
  investorName: string,
  investedCapital: number,
): Promise<void> {
  const orderSnapshot = await getDoc(doc(ordersCol, orderId))
  if (!orderSnapshot.exists()) throw new Error('Order not found')

  const guestId = `${GUEST_USER_PREFIX}${crypto.randomUUID()}`
  const ref = doc(investmentsCol, investmentDocId(orderId, guestId))
  const now = Timestamp.now()
  await setDoc(ref, {
    orderId,
    userId: guestId,
    investorName,
    investorEmail: '',
    investedCapital,
    createdAt: now,
    updatedAt: now,
  })

  await syncAllocationStatus(orderId)
}

export async function removeInvestor(orderId: string, userId: string): Promise<void> {
  await deleteDoc(doc(investmentsCol, investmentDocId(orderId, userId)))

  await syncAllocationStatus(orderId)
}

export async function getInvestorOrders(userId: string): Promise<InvestorOrder[]> {
  const investments = await getInvestmentsByUser(userId)
  if (investments.length === 0) return []

  const orders = await getOrdersByIds(investments.map((i) => i.orderId))
  const orderById = new Map(orders.map((o) => [o.id, o]))

  return investments
    .filter((investment) => orderById.has(investment.orderId))
    .map((investment) => ({
      investment,
      order: orderById.get(investment.orderId) as Order,
    }))
}

export function computeInvestmentFigures(investment: Investment, order: Order): InvestorFigures {
  const ratio = investmentRatio(investment.investedCapital, order.capital * order.quantity)
  return {
    ratio,
    investedCapital: investment.investedCapital,
    grossProfit: order.grossProfit * ratio,
    agentCommission: order.agentCommission * ratio,
    middlemanCommission: order.middlemanCommission * ratio,
    deliveryFee: order.deliveryFee * ratio,
    netProfit: order.netProfit * ratio,
    expectedReturn: investment.investedCapital + order.netProfit * ratio,
  }
}
