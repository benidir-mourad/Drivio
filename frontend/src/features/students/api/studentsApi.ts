import api from '../../../shared/api/client'
import type { PaginatedResponse } from '../../../shared/types/api'
import type { Student, StudentDocument, StudentPayload } from '../types'

export interface StudentListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  license_category?: string
}

export const studentsApi = {
  list: (params: StudentListParams) =>
    api.get<PaginatedResponse<Student>>('/students', { params }),

  get: (id: number) =>
    api.get<{ data: Student }>(`/students/${id}`),

  create: (data: StudentPayload) =>
    api.post<{ data: Student }>('/students', data),

  update: (id: number, data: Partial<StudentPayload>) =>
    api.put<{ data: Student }>(`/students/${id}`, data),

  delete: (id: number) =>
    api.delete(`/students/${id}`),

  uploadDocument: (studentId: number, formData: FormData) =>
    api.post<{ data: StudentDocument }>(`/students/${studentId}/documents`, formData),

  deleteDocument: (studentId: number, documentId: number) =>
    api.delete(`/students/${studentId}/documents/${documentId}`),
}
