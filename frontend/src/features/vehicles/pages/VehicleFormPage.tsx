import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '../hooks/useVehicles'
import { VEHICLE_LICENSE_CATEGORIES } from '../types'

const CURRENT_YEAR = new Date().getFullYear()

const schema = z.object({
  plate_number:     z.string().min(1, 'Requis').max(20),
  brand:            z.string().min(1, 'Requis').max(100),
  model:            z.string().min(1, 'Requis').max(100),
  year:             z.string().min(1, 'Requis'),
  license_category: z.enum(['A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'D'] as const),
  fuel_type:        z.enum(['essence', 'diesel', 'electrique', 'hybride'] as const),
  status:           z.enum(['available', 'maintenance', 'retired'] as const).optional(),
  mileage:          z.string().optional(),
  notes:            z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function VehicleFormPage() {
  const { id }   = useParams<{ id?: string }>()
  const isEdit   = !!id
  const numId    = isEdit ? Number(id) : 0
  const navigate = useNavigate()

  const { data: vehicle, isLoading } = useVehicle(numId)
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle(numId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      license_category: 'B' as const,
      fuel_type: 'essence' as const,
      status: 'available' as const,
      year: String(CURRENT_YEAR),
    },
  })

  useEffect(() => {
    if (vehicle) {
      reset({
        plate_number:     vehicle.plate_number,
        brand:            vehicle.brand,
        model:            vehicle.model,
        year:             String(vehicle.year),
        license_category: vehicle.license_category,
        fuel_type:        vehicle.fuel_type,
        status:           vehicle.status,
        mileage:          vehicle.mileage != null ? String(vehicle.mileage) : '',
        notes:            vehicle.notes ?? '',
      })
    }
  }, [vehicle, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      plate_number:     values.plate_number,
      brand:            values.brand,
      model:            values.model,
      year:             parseInt(values.year, 10),
      license_category: values.license_category,
      fuel_type:        values.fuel_type,
      status:           values.status,
      mileage:          values.mileage ? parseInt(values.mileage, 10) : null,
      notes:            values.notes || null,
    }

    if (isEdit) {
      updateVehicle.mutate(payload, {
        onSuccess: (v) => navigate(`/vehicles/${v.id}`),
      })
    } else {
      createVehicle.mutate(payload, {
        onSuccess: (v) => navigate(`/vehicles/${v.id}`),
      })
    }
  }

  if (isEdit && isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  const isBusy = createVehicle.isPending || updateVehicle.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'}
          </h1>
          {isEdit && vehicle && <StatusBadge status={vehicle.status} />}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Immatriculation" error={errors.plate_number?.message}>
            <input {...register('plate_number')} className={inputCls} placeholder="AB-123-CD" />
          </Field>
          <Field label="Marque" error={errors.brand?.message}>
            <input {...register('brand')} className={inputCls} />
          </Field>
          <Field label="Modèle" error={errors.model?.message}>
            <input {...register('model')} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Année" error={errors.year?.message}>
            <input {...register('year')} type="number" className={inputCls} />
          </Field>
          <Field label="Catégorie" error={errors.license_category?.message}>
            <select {...register('license_category')} className={inputCls}>
              {VEHICLE_LICENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Carburant" error={errors.fuel_type?.message}>
            <select {...register('fuel_type')} className={inputCls}>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electrique">Électrique</option>
              <option value="hybride">Hybride</option>
            </select>
          </Field>
          <Field label="Statut" error={errors.status?.message}>
            <select {...register('status')} className={inputCls}>
              <option value="available">Disponible</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retiré</option>
            </select>
          </Field>
        </div>

        <Field label="Kilométrage" error={errors.mileage?.message}>
          <input {...register('mileage')} type="number" min={0} className={inputCls} />
        </Field>

        <Field label="Notes" error={errors.notes?.message}>
          <textarea {...register('notes')} rows={3} className={inputCls} />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={isBusy}>
            {isEdit ? 'Enregistrer' : 'Créer le véhicule'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} type="button">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
