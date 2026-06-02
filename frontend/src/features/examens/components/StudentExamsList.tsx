import { useState } from 'react'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useExamList } from '../hooks/useExamens'
import {
  EXAM_CENTER_LABELS,
  EXAM_STATUS_COLORS,
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  THEORY_MAX_SCORE,
  THEORY_PASS_THRESHOLD,
} from '../types'
import ExamFormDrawer from './ExamFormDrawer'
import ExamResultDrawer from './ExamResultDrawer'
import type { ExamRegistration } from '../types'

interface Props {
  studentId: number
}

export default function StudentExamsList({ studentId }: Props) {
  const { hasRole } = useAuthStore()
  const canCreate   = hasRole('admin') || hasRole('secretaire')

  const [formOpen, setFormOpen]     = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [selected, setSelected]     = useState<ExamRegistration | null>(null)

  const { data, isLoading } = useExamList({ student_id: studentId, per_page: 50 })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Examens ({data?.meta.total ?? '—'})
        </h2>
        {canCreate && (
          <button
            onClick={() => setFormOpen(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            + Inscrire
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-400 py-4 text-center">Chargement…</p>}
      {!isLoading && !data?.data.length && (
        <p className="text-sm text-gray-400 py-4 text-center">Aucun examen enregistré.</p>
      )}

      {data?.data.length ? (
        <ul className="divide-y divide-gray-100">
          {data.data.map((exam) => (
            <li key={exam.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{EXAM_TYPE_LABELS[exam.type]}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {exam.scheduled_date ?? 'Date à définir'}
                  {exam.center && ` · ${EXAM_CENTER_LABELS[exam.center]}${exam.center_city ? ` ${exam.center_city}` : ''}`}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {exam.score != null && (
                  <span className={`text-sm font-semibold ${exam.status === 'passed' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {exam.score}/{THEORY_MAX_SCORE}
                    <span className="text-xs text-gray-400 ml-0.5">(/{THEORY_PASS_THRESHOLD})</span>
                  </span>
                )}
                <StatusBadge
                  status={exam.status}
                  colorMap={EXAM_STATUS_COLORS}
                  labelMap={EXAM_STATUS_LABELS}
                />
                {canCreate && exam.status === 'planned' && (
                  <button
                    onClick={() => { setSelected(exam); setResultOpen(true) }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Résultat
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ExamFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultStudentId={studentId}
      />
      <ExamResultDrawer
        exam={selected}
        open={resultOpen}
        onClose={() => { setResultOpen(false); setSelected(null) }}
      />
    </div>
  )
}
