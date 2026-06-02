export type ExamType = 'theorique' | 'pratique' | 'reexamen_theorique' | 'reexamen_pratique'
export type ExamStatus = 'planned' | 'passed' | 'failed' | 'absent' | 'cancelled'
export type ExamCenter = 'goca' | 'autosecure' | 'car' | 'other'

export interface ExamStudent {
  id: number
  full_name: string
  email: string
  filiere: string
}

export interface ExamRegistration {
  id: number
  type: ExamType
  center: ExamCenter | null
  center_city: string | null
  scheduled_date: string | null
  registered_at: string | null
  status: ExamStatus
  score: number | null
  is_theory: boolean
  notes: string | null
  student: ExamStudent
  created_at: string | null
  updated_at: string | null
}

export interface ExamPayload {
  student_id: number
  type: ExamType
  center?: ExamCenter | null
  center_city?: string | null
  scheduled_date?: string | null
  registered_at?: string | null
  notes?: string | null
}

export interface ExamResultPayload {
  status: Exclude<ExamStatus, 'planned'>
  score?: number | null
  notes?: string | null
}

export interface ExamStats {
  total: number
  passed: number
  failed: number
  absent: number
  rate: number | null
  avg_score: number | null
}

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  theorique:           'Examen théorique',
  pratique:            'Examen pratique',
  reexamen_theorique:  'Réexamen théorique',
  reexamen_pratique:   'Réexamen pratique',
}

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  planned:   'Planifié',
  passed:    'Réussi',
  failed:    'Échoué',
  absent:    'Absent',
  cancelled: 'Annulé',
}

export const EXAM_CENTER_LABELS: Record<ExamCenter, string> = {
  goca:       'GOCA',
  autosecure: 'AutoSecure',
  car:        'CAR',
  other:      'Autre',
}

export const EXAM_STATUS_COLORS: Record<ExamStatus, string> = {
  planned:   'bg-blue-100 text-blue-800',
  passed:    'bg-emerald-100 text-emerald-800',
  failed:    'bg-red-100 text-red-800',
  absent:    'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export const THEORY_PASS_THRESHOLD = 41
export const THEORY_MAX_SCORE      = 50
