export type VehicleLicenseCategory = 'A' | 'A1' | 'A2' | 'AM' | 'B' | 'B1' | 'C' | 'D'
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride'
export type VehicleStatus = 'available' | 'maintenance' | 'retired'

export interface Vehicle {
  id: number
  plate_number: string
  brand: string
  model: string
  year: number
  license_category: VehicleLicenseCategory
  fuel_type: FuelType
  status: VehicleStatus
  mileage: number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface VehiclePayload {
  plate_number: string
  brand: string
  model: string
  year: number
  license_category: VehicleLicenseCategory
  fuel_type: FuelType
  status?: VehicleStatus
  mileage?: number | null
  notes?: string | null
}

export const VEHICLE_LICENSE_CATEGORIES: VehicleLicenseCategory[] = [
  'A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'D',
]

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  essence:   'Essence',
  diesel:    'Diesel',
  electrique: 'Électrique',
  hybride:   'Hybride',
}
