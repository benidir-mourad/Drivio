import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useCreateInstructor, useInstructor, useUpdateInstructor } from '../hooks/useInstructors'

const schema = z.object({
  first_name:     z.string().min(1, 'Requis').max(100),
  last_name:      z.string().min(1, 'Requis').max(100),
  email:          z.string().min(1, 'Requis').email('Email invalide').max(255),
  phone:          z.string().max(20).optional(),
  license_number: z.string().max(50).optional(),
  hire_date:      z.string().optional(),
  status:         z.enum(['active', 'inactive'] as const).optional(),
  notes:          z.string().optional(),
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

export default function InstructorFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit  = !!id
  const numId   = isEdit ? Number(id) : 0
  const navigate = useNavigate()

  const { data: instructor, isLoading } = useInstructor(numId)
  const createInstructor = useCreateInstructor()
  const updateInstructor = useUpdateInstructor(numId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  useEffect(() => {
    if (instructor) {
      reset({
        first_name:     instructor.first_name,
        last_name:      instructor.last_name,
        email:          instructor.email,
        phone:          instructor.phone ?? '',
        license_number: instructor.license_number ?? '',
        hire_date:      instructor.hire_date ?? '',
        status:         instructor.status,
        notes:          instructor.notes ?? '',
      })
    }
  }, [instructor, reset])

  const onSubmit = (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    ) as FormValues

    if (isEdit) {
      updateInstructor.mutate(payload, {
        onSuccess: (ins) => navigate(`/instructors/${ins.id}`),
      })
    } else {
      createInstructor.mutate(payload, {
        onSuccess: (ins) => navigate(`/instructors/${ins.id}`),
      })
    }
  }

  if (isEdit && isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  const isBusy = createInstructor.isPending || updateInstructor.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Modifier le moniteur' : 'Nouveau moniteur'}
          </h1>
          {isEdit && instructor && <StatusBadge status={instructor.status} />}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" error={errors.first_name?.message}>
            <input {...register('first_name')} className={inputCls} />
          </Field>
          <Field label="Nom" error={errors.last_name?.message}>
            <input {...register('last_name')} className={inputCls} />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <input {...register('email')} type="email" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone" error={errors.phone?.message}>
            <input {...register('phone')} type="tel" className={inputCls} />
          </Field>
          <Field label="N° agrément / BEPECASER" error={errors.license_number?.message}>
            <input {...register('license_number')} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date d'embauche" error={errors.hire_date?.message}>
            <input {...register('hire_date')} type="date" className={inputCls} />
          </Field>
          <Field label="Statut" error={errors.status?.message}>
            <select {...register('status')} className={inputCls}>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </Field>
        </div>

        <Field label="Notes" error={errors.notes?.message}>
          <textarea {...register('notes')} rows={3} className={inputCls} />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={isBusy}>
            {isEdit ? 'Enregistrer' : 'Créer le moniteur'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} type="button">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
