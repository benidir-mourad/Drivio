export type LicenseCategory = 'A' | 'A1' | 'A2' | 'AM' | 'B' | 'B1' | 'BE' | 'C' | 'CE' | 'D'
export type StudentStatus = 'active' | 'suspended' | 'graduated'
export type Filiere = 'classique' | 'cap'
export type DocumentType = 'identity_card' | 'photo' | 'medical_cert' | 'driving_history' | 'other'

export interface StudentDocument {
  id: number
  student_id: number
  type: DocumentType
  file_name: string
  mime_type: string | null
  size: number | null
  created_at: string | null
}

export interface Student {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  date_of_birth: string | null
  license_category: LicenseCategory
  enrollment_date: string
  status: StudentStatus
  filiere: Filiere
  hours_objective: number
  dossier_number: string | null
  notes: string | null
  user_id: number | null
  documents?: StudentDocument[]
  hours_completed?: number
  created_at: string | null
  updated_at: string | null
}

export interface StudentPayload {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  address?: string | null
  date_of_birth?: string | null
  license_category: LicenseCategory
  enrollment_date: string
  status?: StudentStatus
  filiere?: Filiere
  hours_objective?: number
  dossier_number?: string | null
  notes?: string | null
  user_id?: number | null
}

export const LICENSE_CATEGORIES: LicenseCategory[] = ['A', 'A1', 'A2', 'AM', 'B', 'B1', 'BE', 'C', 'CE', 'D']

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identity_card:   'Pièce d\'identité',
  photo:           'Photo',
  medical_cert:    'Certificat médical',
  driving_history: 'Relevé de conduite',
  other:           'Autre',
}
