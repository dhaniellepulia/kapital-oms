import {
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore'

import { agentCommission, middlemanCommission, netProfit, type CommissionRates } from '@/lib/calculations'
import { investmentsCol, ordersCol } from '@/lib/collections'
import { db } from '@/lib/firebase'
import { getSettings } from '@/features/settings/api/settingsService'
import type { Order, OrderInput, OrderStatus } from '../types'

function toOrder(id: string, data: DocumentData): Order {
  return {
    id,
    orderNumber: data.orderNumber as string,
    itemName: data.itemName as string,
    quantity: data.quantity as number,
    capital: data.capital as number,
    sellingAmount: data.sellingAmount as number,
    grossProfit: data.grossProfit as number,
    deliveryFee: data.deliveryFee as number,
    agentCommission: data.agentCommission as number,
    middlemanCommission: data.middlemanCommission as number,
    netProfit: data.netProfit as number,
    paymentDate: (data.paymentDate as Timestamp).toDate(),
    notes: data.notes as string,
    status: data.status as OrderStatus,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    createdBy: data.createdBy as string,
  }
}

export function buildOrderNumber(orderId: string): string {
  return `ORD-${orderId.slice(-6).toUpperCase()}`
}

export async function createOrder(input: OrderInput, createdBy: string): Promise<Order> {
  const ref = doc(ordersCol)
  const now = Timestamp.now()
  const status = input.status ?? 'open'
  const rates = await getSettings()
  const commissionRates: CommissionRates = {
    agent: rates.agentCommissionRate,
    middleman: rates.middlemanCommissionRate,
  }

  const order: Order = {
    id: ref.id,
    orderNumber: buildOrderNumber(ref.id),
    ...input,
    status,
    agentCommission: agentCommission(input.grossProfit, commissionRates.agent),
    middlemanCommission: middlemanCommission(input.grossProfit, commissionRates.middleman),
    netProfit: netProfit(input.grossProfit, input.deliveryFee, commissionRates),
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
    createdBy,
  }

  await setDoc(ref, {
    orderNumber: order.orderNumber,
    itemName: order.itemName,
    quantity: order.quantity,
    capital: order.capital,
    sellingAmount: order.sellingAmount,
    grossProfit: order.grossProfit,
    deliveryFee: order.deliveryFee,
    agentCommission: order.agentCommission,
    middlemanCommission: order.middlemanCommission,
    netProfit: order.netProfit,
    paymentDate: Timestamp.fromDate(order.paymentDate),
    notes: order.notes,
    status: order.status,
    createdBy,
    createdAt: now,
    updatedAt: now,
  })

  return order
}

export async function getOrder(id: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(ordersCol, id))
  return snapshot.exists() ? toOrder(snapshot.id, snapshot.data()) : null
}

export async function getOrders(): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCol, orderBy('createdAt', 'desc')))
  return snapshot.docs.map((d) => toOrder(d.id, d.data()))
}

const IDS_PER_QUERY = 10

export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  if (ids.length === 0) return []

  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += IDS_PER_QUERY) {
    chunks.push(ids.slice(i, i + IDS_PER_QUERY))
  }

  const results = await Promise.all(
    chunks.map((chunk) => getDocs(query(ordersCol, where(documentId(), 'in', chunk)))),
  )
  return results.flatMap((snapshot) => snapshot.docs.map((d) => toOrder(d.id, d.data())))
}

export async function updateOrder(id: string, patch: Partial<OrderInput>): Promise<void> {
  const snapshot = await getDoc(doc(ordersCol, id))
  if (!snapshot.exists()) throw new Error('Order not found')

  const current = toOrder(snapshot.id, snapshot.data())
  const grossProfit = patch.grossProfit ?? current.grossProfit
  const deliveryFee = patch.deliveryFee ?? current.deliveryFee
  const rates = await getSettings()
  const commissionRates: CommissionRates = {
    agent: rates.agentCommissionRate,
    middleman: rates.middlemanCommissionRate,
  }
  const merged = {
    ...current,
    ...patch,
    agentCommission: agentCommission(grossProfit, commissionRates.agent),
    middlemanCommission: middlemanCommission(grossProfit, commissionRates.middleman),
    netProfit: netProfit(grossProfit, deliveryFee, commissionRates),
  }

  await updateDoc(doc(ordersCol, id), {
    itemName: merged.itemName,
    quantity: merged.quantity,
    capital: merged.capital,
    sellingAmount: merged.sellingAmount,
    grossProfit: merged.grossProfit,
    deliveryFee: merged.deliveryFee,
    agentCommission: merged.agentCommission,
    middlemanCommission: merged.middlemanCommission,
    netProfit: merged.netProfit,
    paymentDate: Timestamp.fromDate(merged.paymentDate),
    notes: merged.notes,
    status: merged.status,
    updatedAt: Timestamp.now(),
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(ordersCol, id), { status, updatedAt: Timestamp.now() })
}

export async function deleteOrder(id: string): Promise<void> {
  const investments = await getDocs(query(investmentsCol, where('orderId', '==', id)))
  const batch = writeBatch(db)
  investments.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(ordersCol, id))
  await batch.commit()
}
