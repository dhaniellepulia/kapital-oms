import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersKeys } from '@/features/orders/hooks/useOrders'
import * as investmentsService from '../api/investmentsService'
import type { Investment } from '../types'

export const investmentsKeys = {
  all: ['investments'] as const,
  byOrder: (orderId: string) => ['investments', 'by-order', orderId] as const,
}

export function useInvestmentsByOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: investmentsKeys.byOrder(orderId ?? ''),
    queryFn: () => investmentsService.getInvestmentsByOrder(orderId as string),
    enabled: Boolean(orderId),
  })
}

export function useAllInvestments() {
  const query = useQuery({ queryKey: investmentsKeys.all, queryFn: investmentsService.getAllInvestments })
  const byOrderId = useMemo(() => {
    const map: Record<string, Investment[]> = {}
    for (const inv of query.data ?? []) {
      const list = map[inv.orderId] ?? []
      list.push(inv)
      map[inv.orderId] = list
    }
    return map
  }, [query.data])
  return { ...query, byOrderId }
}

export function useAssignInvestor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, userId, investedCapital }: { orderId: string; userId: string; investedCapital: number }) =>
      investmentsService.assignInvestor(orderId, userId, investedCapital),
    onSuccess: (_, { orderId }) => {
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.all })
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.byOrder(orderId) })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

export function useAssignGuestInvestor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      investorName,
      investedCapital,
    }: {
      orderId: string
      investorName: string
      investedCapital: number
    }) => investmentsService.assignGuestInvestor(orderId, investorName, investedCapital),
    onSuccess: (_, { orderId }) => {
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.all })
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.byOrder(orderId) })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

export function useRemoveInvestor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, userId }: { orderId: string; userId: string }) =>
      investmentsService.removeInvestor(orderId, userId),
    onSuccess: (_, { orderId }) => {
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.all })
      void queryClient.invalidateQueries({ queryKey: investmentsKeys.byOrder(orderId) })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

export function useInvestmentsByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['investments', 'user', userId ?? ''],
    queryFn: () => investmentsService.getInvestmentsByUser(userId as string),
    enabled: Boolean(userId),
  })
}

export function useInvestorOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['investor-orders', userId ?? ''],
    queryFn: () => investmentsService.getInvestorOrders(userId as string),
    enabled: Boolean(userId),
  })
}
