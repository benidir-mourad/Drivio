import api from '../../../shared/api/client'
import type { PaginatedResponse } from '../../../shared/types/api'
import type { CalendarData, Lesson, LessonPayload } from '../types'

export interface LessonListParams {
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
  instructor_id?: number
  student_id?: number
  vehicle_id?: number
  status?: string
  type?: string
}

export interface CalendarParams {
  date_from: string
  date_to: string
  instructor_id?: number
  student_id?: number
}

export const planningApi = {
  list: (params: LessonListParams) =>
    api.get<PaginatedResponse<Lesson>>('/lessons', { params }),

  calendar: (params: CalendarParams) =>
    api.get<{ data: CalendarData }>('/lessons/calendar', { params }),

  get: (id: number) =>
    api.get<{ data: Lesson }>(`/lessons/${id}`),

  create: (data: LessonPayload) =>
    api.post<{ data: Lesson }>('/lessons', data),

  update: (id: number, data: Partial<LessonPayload>) =>
    api.put<{ data: Lesson }>(`/lessons/${id}`, data),

  delete: (id: number) =>
    api.delete(`/lessons/${id}`),

  cancel: (id: number, reason?: string) =>
    api.patch<{ data: Lesson }>(`/lessons/${id}/cancel`, { cancellation_reason: reason }),

  complete: (id: number) =>
    api.patch<{ data: Lesson }>(`/lessons/${id}/complete`),

  markNoShow: (id: number) =>
    api.patch<{ data: Lesson }>(`/lessons/${id}/no-show`),
}
