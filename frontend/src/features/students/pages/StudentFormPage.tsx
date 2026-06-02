import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../../shared/components/Button'
import { useCreateStudent, useStudent, useUpdateStudent } from '../hooks/useStudents'
import { LICENSE_CATEGORIES } from '../types'

const schema = z.object({
  first_name:       z.string().min(1, 'Requis').max(100),
  last_name:        z.string().min(1, 'Requis').max(100),
  email:            z.string().min(1, 'Requis').email('Email invalide').max(255),
  phone:            z.string().max(20).optional(),
  address:          z.string().max(500).optional(),
  date_of_birth:    z.string().optional(),
  license_category: z.enum(['A', 'A1', 'A2', 'AM', 'B', 'B1', 'BE', 'C', 'CE', 'D'] as const),
  enrollment_date:  z.string().min(1, 'Requis'),
  status:           z.enum(['active', 'suspended', 'graduated'] as const).optional(),
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

export default function StudentFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit  = !!id
  const numId   = isEdit ? Number(id) : 0
  const navigate = useNavigate()

  const { data: student, isLoading } = useStudent(numId)
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent(numId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { license_category: 'B', status: 'active' },
  })

  useEffect(() => {
    if (student) {
      reset({
        first_name:       student.first_name,
        last_name:        student.last_name,
        email:            student.email,
        phone:            student.phone ?? '',
        address:          student.address ?? '',
        date_of_birth:    student.date_of_birth ?? '',
        license_category: student.license_category,
        enrollment_date:  student.enrollment_date,
        status:           student.status,
        notes:            student.notes ?? '',
      })
    }
  }, [student, reset])

  const onSubmit = (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    ) as FormValues

    if (isEdit) {
      updateStudent.mutate(payload, {
        onSuccess: (s) => navigate(`/students/${s.id}`),
      })
    } else {
      createStudent.mutate(payload, {
        onSuccess: (s) => navigate(`/students/${s.id}`),
      })
    }
  }

  if (isEdit && isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  const isBusy = createStudent.isPending || updateStudent.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Modifier l\'élève' : 'Nouvel élève'}
        </h1>
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
          <Field label="Date de naissance" error={errors.date_of_birth?.message}>
            <input {...register('date_of_birth')} type="date" className={inputCls} />
          </Field>
        </div>

        <Field label="Adresse" error={errors.address?.message}>
          <input {...register('address')} className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Catégorie" error={errors.license_category?.message}>
            <select {...register('license_category')} className={inputCls}>
              {LICENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date d'inscription" error={errors.enrollment_date?.message}>
            <input {...register('enrollment_date')} type="date" className={inputCls} />
          </Field>
          <Field label="Statut" error={errors.status?.message}>
            <select {...register('status')} className={inputCls}>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="graduated">Diplômé</option>
            </select>
          </Field>
        </div>

        <Field label="Notes" error={errors.notes?.message}>
          <textarea {...register('notes')} rows={3} className={inputCls} />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={isBusy}>
            {isEdit ? 'Enregistrer' : 'Créer l\'élève'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} type="button">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
