export type LessonType = 'conduite' | 'code' | 'accompagnement' | 'bilan' | 'examen_blanc'
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface LessonStudent {
  id: number
  full_name: string
  email: string
}

export interface LessonInstructor {
  id: number
  full_name: string
  email: string
}

export interface LessonVehicle {
  id: number
  plate_number: string
  brand: string
  model: string
}

export interface Lesson {
  id: number
  type: LessonType
  starts_at: string
  ends_at: string
  duration_minutes: number
  status: LessonStatus
  cancellation_reason: string | null
  notes: string | null
  student: LessonStudent
  instructor: LessonInstructor
  vehicle: LessonVehicle | null
  created_at: string | null
  updated_at: string | null
}

export interface LessonPayload {
  student_id: number
  instructor_id: number
  vehicle_id?: number | null
  type: LessonType
  starts_at: string
  ends_at: string
  notes?: string | null
}

export interface CalendarData {
  [date: string]: Lesson[]
}

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  conduite:      'Conduite',
  code:          'Code',
  accompagnement: 'Accompagnement',
  bilan:         'Bilan',
  examen_blanc:  'Examen blanc',
}

export const LESSON_TYPE_COLORS: Record<LessonType, { bg: string; border: string; text: string; dot: string }> = {
  conduite:      { bg: 'bg-indigo-50',  border: 'border-indigo-400', text: 'text-indigo-800',  dot: 'bg-indigo-400' },
  code:          { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', dot: 'bg-emerald-400' },
  accompagnement:{ bg: 'bg-amber-50',   border: 'border-amber-400',  text: 'text-amber-800',   dot: 'bg-amber-400' },
  bilan:         { bg: 'bg-purple-50',  border: 'border-purple-400', text: 'text-purple-800',  dot: 'bg-purple-400' },
  examen_blanc:  { bg: 'bg-red-50',     border: 'border-red-400',    text: 'text-red-800',     dot: 'bg-red-400' },
}

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: 'Planifiée',
  completed: 'Effectuée',
  cancelled: 'Annulée',
  no_show:   'Absence',
}
