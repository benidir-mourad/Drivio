import api from '../../../shared/api/client'
import type { PaginatedResponse } from '../../../shared/types/api'
import type { ExamPayload, ExamRegistration, ExamResultPayload, ExamStats } from '../types'

export interface ExamListParams {
  page?: number
  per_page?: number
  student_id?: number
  type?: string
  status?: string
  date_from?: string
  date_to?: string
}

export const examensApi = {
  list: (params: ExamListParams) =>
    api.get<PaginatedResponse<ExamRegistration>>('/exam-registrations', { params }),

  get: (id: number) =>
    api.get<{ data: ExamRegistration }>(`/exam-registrations/${id}`),

  create: (data: ExamPayload) =>
    api.post<{ data: ExamRegistration }>('/exam-registrations', data),

  update: (id: number, data: Partial<ExamPayload>) =>
    api.put<{ data: ExamRegistration }>(`/exam-registrations/${id}`, data),

  recordResult: (id: number, data: ExamResultPayload) =>
    api.patch<{ data: ExamRegistration }>(`/exam-registrations/${id}/result`, data),

  delete: (id: number) =>
    api.delete(`/exam-registrations/${id}`),

  stats: (year?: number) =>
    api.get<{ data: Record<string, ExamStats> }>('/exam-registrations/stats', {
      params: year ? { year } : {},
    }),
}
