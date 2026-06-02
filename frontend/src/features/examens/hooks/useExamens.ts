import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { examensApi, type ExamListParams } from '../api/examensApi'
import type { ExamPayload, ExamResultPayload } from '../types'

export function useExamList(params: ExamListParams) {
  return useQuery({
    queryKey: ['exams', 'list', params],
    queryFn:  () => examensApi.list(params).then((r) => r.data),
  })
}

export function useExam(id: number) {
  return useQuery({
    queryKey: ['exams', id],
    queryFn:  () => examensApi.get(id).then((r) => r.data.data),
    enabled:  id > 0,
  })
}

export function useExamStats(year?: number) {
  return useQuery({
    queryKey: ['exams', 'stats', year],
    queryFn:  () => examensApi.stats(year).then((r) => r.data.data),
    staleTime: 60_000,
  })
}

export function useCreateExam() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: ExamPayload) => examensApi.create(data).then((r) => r.data.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast('Inscription créée.', 'success') },
    onError:    () => toast('Erreur lors de la création.', 'error'),
  })
}

export function useUpdateExam(id: number) {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: Partial<ExamPayload>) => examensApi.update(id, data).then((r) => r.data.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast('Inscription mise à jour.', 'success') },
    onError:    () => toast('Erreur lors de la mise à jour.', 'error'),
  })
}

export function useRecordResult(id: number) {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: ExamResultPayload) => examensApi.recordResult(id, data).then((r) => r.data.data),
    onSuccess:  (exam) => {
      qc.invalidateQueries({ queryKey: ['exams'] })
      qc.invalidateQueries({ queryKey: ['students'] })
      toast(`Résultat enregistré : ${exam.status === 'passed' ? '✓ Réussi' : exam.status}.`, 'success')
    },
    onError:    () => toast('Erreur lors de l\'enregistrement.', 'error'),
  })
}

export function useDeleteExam() {
  const qc    = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => examensApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast('Inscription supprimée.', 'success') },
    onError:    () => toast('Erreur lors de la suppression.', 'error'),
  })
}
