import type { Role } from '../../store/authStore'

export const ROLE_HOME: Record<Role, string> = {
  admin:      '/dashboard',
  secretaire: '/dashboard',
  moniteur:   '/dashboard',
  eleve:      '/dashboard',
}

export const ACCESS = {
  students:    ['admin', 'secretaire', 'moniteur'] as Role[],
  instructors: ['admin', 'secretaire', 'moniteur'] as Role[],
  vehicles:    ['admin', 'secretaire', 'moniteur'] as Role[],
  planning:    ['admin', 'secretaire', 'moniteur'] as Role[],
  pedagogy:    ['admin', 'secretaire', 'moniteur'] as Role[],
  finance:     ['admin', 'secretaire'] as Role[],
  settings:    ['admin'] as Role[],
  own_data:    ['eleve'] as Role[],
}

export function homeFor(role: Role | null): string {
  if (!role) return '/login'
  return ROLE_HOME[role]
}
