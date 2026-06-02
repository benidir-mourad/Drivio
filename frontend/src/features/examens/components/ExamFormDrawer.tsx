import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../../shared/components/Button'
import { useStudentList } from '../../students/hooks/useStudents'
import { useCreateExam, useUpdateExam } from '../hooks/useExamens'
import { EXAM_CENTER_LABELS, EXAM_TYPE_LABELS, type ExamRegistration } from '../types'

const schema = z.object({
  student_id:     z.string().min(1, 'Requis'),
  type:           z.enum(['theorique', 'pratique', 'reexamen_theorique', 'reexamen_pratique'] as const),
  center:         z.enum(['goca', 'autosecure', 'car', 'other'] as const).optional(),
  center_city:    z.string().max(100).optional(),
  scheduled_date: z.string().optional(),
  registered_at:  z.string().optional(),
  notes:          z.string().optional(),
})

type FormValues = z.infer<typeof schema>

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

interface Props {
  open: boolean
  onClose: () => void
  editExam?: ExamRegistration | null
  defaultStudentId?: number
}

export default function ExamFormDrawer({ open, onClose, editExam, defaultStudentId }: Props) {
  const isEdit = !!editExam

  const { data: studentsData } = useStudentList({ per_page: 200, status: 'active' })
  const createExam = useCreateExam()
  const updateExam = useUpdateExam(editExam?.id ?? 0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:       'theorique',
      student_id: defaultStudentId ? String(defaultStudentId) : '',
    },
  })

  useEffect(() => {
    if (editExam) {
      reset({
        student_id:     String(editExam.student.id),
        type:           editExam.type,
        center:         editExam.center ?? undefined,
        center_city:    editExam.center_city ?? '',
        scheduled_date: editExam.scheduled_date ?? '',
        registered_at:  editExam.registered_at ?? '',
        notes:          editExam.notes ?? '',
      })
    } else if (!open) {
      reset()
    }
  }, [editExam, open, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      student_id:     parseInt(values.student_id),
      type:           values.type,
      center:         values.center ?? null,
      center_city:    values.center_city || null,
      scheduled_date: values.scheduled_date || null,
      registered_at:  values.registered_at || null,
      notes:          values.notes || null,
    }

    const action = isEdit
      ? updateExam.mutateAsync(payload)
      : createExam.mutateAsync(payload)

    action.then(() => onClose()).catch(() => {})
  }

  if (!open) return null

  const isBusy = createExam.isPending || updateExam.isPending

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-40 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier l\'inscription' : 'Nouvelle inscription'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Élève" error={errors.student_id?.message}>
            <select {...register('student_id')} className={inputCls} disabled={isEdit}>
              <option value="">— Choisir —</option>
              {studentsData?.data.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Type d'examen" error={errors.type?.message}>
            <select {...register('type')} className={inputCls}>
              {Object.entries(EXAM_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Centre" error={errors.center?.message}>
              <select {...register('center')} className={inputCls}>
                <option value="">— Choisir —</option>
                {Object.entries(EXAM_CENTER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Ville" error={errors.center_city?.message}>
              <input {...register('center_city')} className={inputCls} placeholder="ex : Namur" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date d'examen" error={errors.scheduled_date?.message}>
              <input {...register('scheduled_date')} type="date" className={inputCls} />
            </Field>
            <Field label="Date d'inscription" error={errors.registered_at?.message}>
              <input {...register('registered_at')} type="date" className={inputCls} />
            </Field>
          </div>

          <Field label="Notes" error={errors.notes?.message}>
            <textarea {...register('notes')} rows={3} className={inputCls} />
          </Field>
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
          <Button type="button" loading={isBusy} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Enregistrer' : 'Créer l\'inscription'}
          </Button>
          <Button variant="secondary" onClick={onClose} type="button">Annuler</Button>
        </div>
      </div>
    </>
  )
}
