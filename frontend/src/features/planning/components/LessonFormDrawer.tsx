import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../../shared/components/Button'
import { useInstructorList } from '../../instructors/hooks/useInstructors'
import { useStudentList } from '../../students/hooks/useStudents'
import { useVehicleList } from '../../vehicles/hooks/useVehicles'
import { useCreateLesson, useUpdateLesson } from '../hooks/usePlanning'
import { LESSON_TYPE_LABELS, type Lesson } from '../types'

const schema = z.object({
  student_id:    z.string().min(1, 'Requis'),
  instructor_id: z.string().min(1, 'Requis'),
  vehicle_id:    z.string().optional(),
  type:          z.enum(['conduite', 'code', 'accompagnement', 'bilan', 'examen_blanc'] as const),
  date:          z.string().min(1, 'Requis'),
  start_time:    z.string().min(1, 'Requis'),
  end_time:      z.string().min(1, 'Requis'),
  notes:         z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  initialDate?: string
  initialStartTime?: string
  editLesson?: Lesson | null
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function LessonFormDrawer({ open, onClose, initialDate, initialStartTime, editLesson }: Props) {
  const isEdit = !!editLesson

  const { data: studentsData }     = useStudentList({ per_page: 200 })
  const { data: instructorsData }  = useInstructorList({ per_page: 200, status: 'active' })
  const { data: vehiclesData }     = useVehicleList({ per_page: 200, status: 'available' })

  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson(editLesson?.id ?? 0)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:       'conduite',
      date:       initialDate ?? '',
      start_time: initialStartTime ?? '09:00',
      end_time:   initialStartTime
        ? (() => {
            const [h, m] = initialStartTime.split(':').map(Number)
            const endH = Math.min(h + 1, 20)
            return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          })()
        : '10:00',
    },
  })

  useEffect(() => {
    if (editLesson) {
      reset({
        student_id:    String(editLesson.student.id),
        instructor_id: String(editLesson.instructor.id),
        vehicle_id:    editLesson.vehicle ? String(editLesson.vehicle.id) : '',
        type:          editLesson.type,
        date:          editLesson.starts_at.slice(0, 10),
        start_time:    editLesson.starts_at.slice(11, 16),
        end_time:      editLesson.ends_at.slice(11, 16),
        notes:         editLesson.notes ?? '',
      })
    } else if (!open) {
      reset()
    }
  }, [editLesson, open, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      student_id:    parseInt(values.student_id),
      instructor_id: parseInt(values.instructor_id),
      vehicle_id:    values.vehicle_id ? parseInt(values.vehicle_id) : null,
      type:          values.type,
      starts_at:     `${values.date} ${values.start_time}:00`,
      ends_at:       `${values.date} ${values.end_time}:00`,
      notes:         values.notes || null,
    }

    const action = isEdit
      ? updateLesson.mutateAsync(payload)
      : createLesson.mutateAsync(payload)

    action.then(() => onClose()).catch(() => {})
  }

  const selectedType = watch('type')

  if (!open) return null

  const isBusy = createLesson.isPending || updateLesson.isPending

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier la séance' : 'Nouvelle séance'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Type selector — pill buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de séance</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(LESSON_TYPE_LABELS) as [FormValues['type'], string][]).map(([val, label]) => (
                <label key={val} className="cursor-pointer">
                  <input {...register('type')} type="radio" value={val} className="sr-only" />
                  <span className={`inline-block px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedType === val
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                  }`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <Field label="Date" error={errors.date?.message}>
                <input {...register('date')} type="date" className={inputCls} />
              </Field>
            </div>
            <Field label="Début" error={errors.start_time?.message}>
              <input {...register('start_time')} type="time" step={1800} className={inputCls} />
            </Field>
            <Field label="Fin" error={errors.end_time?.message}>
              <input {...register('end_time')} type="time" step={1800} className={inputCls} />
            </Field>
          </div>

          {/* Student */}
          <Field label="Élève" error={errors.student_id?.message}>
            <select {...register('student_id')} className={inputCls}>
              <option value="">— Choisir —</option>
              {studentsData?.data.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </Field>

          {/* Instructor */}
          <Field label="Moniteur" error={errors.instructor_id?.message}>
            <select {...register('instructor_id')} className={inputCls}>
              <option value="">— Choisir —</option>
              {instructorsData?.data.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name}</option>
              ))}
            </select>
          </Field>

          {/* Vehicle (optional for code lessons) */}
          <Field label="Véhicule (optionnel)" error={errors.vehicle_id?.message}>
            <select {...register('vehicle_id')} className={inputCls}>
              <option value="">— Aucun —</option>
              {vehiclesData?.data.map((v) => (
                <option key={v.id} value={v.id}>{v.plate_number} — {v.brand} {v.model}</option>
              ))}
            </select>
          </Field>

          {/* Notes */}
          <Field label="Notes" error={errors.notes?.message}>
            <textarea {...register('notes')} rows={3} className={inputCls} placeholder="Observations, consignes particulières…" />
          </Field>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
          <Button type="button" loading={isBusy} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Enregistrer' : 'Créer la séance'}
          </Button>
          <Button variant="secondary" onClick={onClose} type="button">Annuler</Button>
        </div>
      </div>
    </>
  )
}
