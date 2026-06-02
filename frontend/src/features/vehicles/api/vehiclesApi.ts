import api from '../../../shared/api/client'
import type { PaginatedResponse } from '../../../shared/types/api'
import type { Vehicle, VehiclePayload } from '../types'

export interface VehicleListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  license_category?: string
}

export const vehiclesApi = {
  list: (params: VehicleListParams) =>
    api.get<PaginatedResponse<Vehicle>>('/vehicles', { params }),

  get: (id: number) =>
    api.get<{ data: Vehicle }>(`/vehicles/${id}`),

  create: (data: VehiclePayload) =>
    api.post<{ data: Vehicle }>('/vehicles', data),

  update: (id: number, data: Partial<VehiclePayload>) =>
    api.put<{ data: Vehicle }>(`/vehicles/${id}`, data),

  delete: (id: number) =>
    api.delete(`/vehicles/${id}`),
}
