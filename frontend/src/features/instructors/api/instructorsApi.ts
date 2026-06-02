import api from '../../../shared/api/client'
import type { PaginatedResponse } from '../../../shared/types/api'
import type { Instructor, InstructorPayload } from '../types'

export interface InstructorListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
}

export const instructorsApi = {
  list: (params: InstructorListParams) =>
    api.get<PaginatedResponse<Instructor>>('/instructors', { params }),

  get: (id: number) =>
    api.get<{ data: Instructor }>(`/instructors/${id}`),

  create: (data: InstructorPayload) =>
    api.post<{ data: Instructor }>('/instructors', data),

  update: (id: number, data: Partial<InstructorPayload>) =>
    api.put<{ data: Instructor }>(`/instructors/${id}`, data),

  delete: (id: number) =>
    api.delete(`/instructors/${id}`),
}
