import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usersService from '../api/usersService'
import type { UserRole } from '../types'

export const usersKeys = {
  all: ['users'] as const,
}

export function useUsers() {
  return useQuery({ queryKey: usersKeys.all, queryFn: usersService.getUsers })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) =>
      usersService.updateUserRole(uid, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}
