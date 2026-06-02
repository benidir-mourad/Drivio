import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { planningApi, type CalendarParams, type LessonListParams } from '../api/planningApi'
import type { LessonPayload } from '../types'

export function useLessonList(params: LessonListParams) {
  return useQuery({
    queryKey: ['lessons', 'list', params],
    queryFn: () => planningApi.list(params).then((r) => r.data),
  })
}

export function useCalendar(params: CalendarParams) {
  return useQuery({
    queryKey: ['lessons', 'calendar', params],
    queryFn: () => planningApi.calendar(params).then((r) => r.data.data),
    staleTime: 30_000,
  })
}

export function useLesson(id: number) {
  return useQuery({
    queryKey: ['lessons', id],
    queryFn: () => planningApi.get(id).then((r) => r.data.data),
    enabled: id > 0,
  })
}

export function useCreateLesson() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: LessonPayload) => planningApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Séance créée.', 'success')
    },
    onError: (err: any) => {
      if (err?.response?.data?.code === 'CONFLICT') {
        const conflicts: string[] = err.response.data.conflicts ?? []
        const labels: Record<string, string> = {
          instructor: 'moniteur',
          vehicle:    'véhicule',
          student:    'élève',
        }
        const detail = conflicts.map((c) => labels[c] ?? c).join(', ')
        toast(`Conflit détecté : ${detail} déjà occupé(s) sur ce créneau.`, 'error', 6000)
      } else {
        toast('Erreur lors de la création de la séance.', 'error')
      }
    },
  })
}

export function useUpdateLesson(id: number) {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: Partial<LessonPayload>) => planningApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Séance mise à jour.', 'success')
    },
    onError: (err: any) => {
      if (err?.response?.data?.code === 'CONFLICT') {
        const conflicts: string[] = err.response.data.conflicts ?? []
        const labels: Record<string, string> = { instructor: 'moniteur', vehicle: 'véhicule', student: 'élève' }
        const detail = conflicts.map((c) => labels[c] ?? c).join(', ')
        toast(`Conflit détecté : ${detail} déjà occupé(s) sur ce créneau.`, 'error', 6000)
      } else {
        toast('Erreur lors de la mise à jour.', 'error')
      }
    },
  })
}

export function useDeleteLesson() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => planningApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Séance supprimée.', 'success')
    },
    onError: () => toast('Erreur lors de la suppression.', 'error'),
  })
}

export function useCancelLesson() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      planningApi.cancel(id, reason).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Séance annulée.', 'success')
    },
    onError: () => toast('Erreur lors de l\'annulation.', 'error'),
  })
}

export function useCompleteLesson() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => planningApi.complete(id).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Séance marquée comme effectuée.', 'success')
    },
    onError: () => toast('Erreur.', 'error'),
  })
}

export function useMarkNoShow() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => planningApi.markNoShow(id).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast('Absence enregistrée.', 'success')
    },
    onError: () => toast('Erreur.', 'error'),
  })
}
