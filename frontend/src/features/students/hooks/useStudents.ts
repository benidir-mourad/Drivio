import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { studentsApi, type StudentListParams } from '../api/studentsApi'
import type { StudentPayload } from '../types'

export function useStudentList(params: StudentListParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.list(params).then((r) => r.data),
  })
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(id).then((r) => r.data.data),
    enabled: id > 0,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: StudentPayload) => studentsApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast('Élève créé avec succès.', 'success')
    },
    onError: () => toast('Erreur lors de la création.', 'error'),
  })
}

export function useUpdateStudent(id: number) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: Partial<StudentPayload>) =>
      studentsApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast('Élève mis à jour.', 'success')
    },
    onError: () => toast('Erreur lors de la mise à jour.', 'error'),
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast('Élève supprimé.', 'success')
    },
    onError: () => toast('Erreur lors de la suppression.', 'error'),
  })
}

export function useUploadStudentDocument(studentId: number) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (formData: FormData) =>
      studentsApi.uploadDocument(studentId, formData).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', studentId] })
      toast('Document uploadé.', 'success')
    },
    onError: () => toast('Erreur lors de l\'upload.', 'error'),
  })
}

export function useDeleteStudentDocument(studentId: number) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (documentId: number) =>
      studentsApi.deleteDocument(studentId, documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students', studentId] })
      toast('Document supprimé.', 'success')
    },
    onError: () => toast('Erreur lors de la suppression.', 'error'),
  })
}
