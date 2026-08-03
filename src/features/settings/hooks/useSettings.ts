import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as settingsService from '../api/settingsService'
import type { AppSettings } from '../types'

export const settingsKeys = {
  all: ['settings'] as const,
}

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: settingsService.getSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<AppSettings>) => settingsService.updateSettings(patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}
