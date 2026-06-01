import api from '../../../shared/api/client'
import type { AuthUser } from '../../../store/authStore'

interface LoginPayload {
  email: string
  password: string
}

interface AuthResponse {
  data: AuthUser
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<AuthResponse>('/auth/me'),
}
