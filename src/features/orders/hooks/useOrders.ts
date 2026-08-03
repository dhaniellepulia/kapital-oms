import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import * as ordersService from '../api/ordersService'
import type { OrderInput, OrderStatus } from '../types'

export const ordersKeys = {
  all: ['orders'] as const,
  detail: (id: string) => ['orders', id] as const,
}

export function useOrders() {
  return useQuery({ queryKey: ordersKeys.all, queryFn: ordersService.getOrders })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ordersKeys.detail(id ?? ''),
    queryFn: () => ordersService.getOrder(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: OrderInput) => {
      const uid = user?.uid
      if (!uid) throw new Error('Not authenticated')
      return ordersService.createOrder(input, uid)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<OrderInput> }) =>
      ordersService.updateOrder(id, patch),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordersService.deleteOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all })
      void queryClient.invalidateQueries({ queryKey: ordersKeys.detail('') })
    },
  })
}
