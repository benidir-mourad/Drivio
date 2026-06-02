export type InstructorStatus = 'active' | 'inactive'

export interface Instructor {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  license_number: string | null
  hire_date: string | null
  status: InstructorStatus
  notes: string | null
  user_id: number | null
  created_at: string | null
  updated_at: string | null
}

export interface InstructorPayload {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  license_number?: string | null
  hire_date?: string | null
  status?: InstructorStatus
  notes?: string | null
  user_id?: number | null
}
