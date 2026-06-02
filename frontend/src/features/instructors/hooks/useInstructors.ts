import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { instructorsApi, type InstructorListParams } from '../api/instructorsApi'
import type { InstructorPayload } from '../types'

export function useInstructorList(params: InstructorListParams) {
  return useQuery({
    queryKey: ['instructors', params],
    queryFn: () => instructorsApi.list(params).then((r) => r.data),
  })
}

export function useInstructor(id: number) {
  return useQuery({
    queryKey: ['instructors', id],
    queryFn: () => instructorsApi.get(id).then((r) => r.data.data),
    enabled: id > 0,
  })
}

export function useCreateInstructor() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: InstructorPayload) =>
      instructorsApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructors'] })
      toast('Moniteur créé avec succès.', 'success')
    },
    onError: () => toast('Erreur lors de la création.', 'error'),
  })
}

export function useUpdateInstructor(id: number) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: Partial<InstructorPayload>) =>
      instructorsApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructors'] })
      toast('Moniteur mis à jour.', 'success')
    },
    onError: () => toast('Erreur lors de la mise à jour.', 'error'),
  })
}

export function useDeleteInstructor() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => instructorsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructors'] })
      toast('Moniteur supprimé.', 'success')
    },
    onError: () => toast('Erreur lors de la suppression.', 'error'),
  })
}
