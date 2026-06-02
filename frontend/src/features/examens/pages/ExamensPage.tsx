import { useState } from 'react'
import Pagination from '../../../shared/components/Pagination'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useDeleteExam, useExamList } from '../hooks/useExamens'
import type { ExamRegistration } from '../types'
import {
  EXAM_CENTER_LABELS,
  EXAM_STATUS_COLORS,
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  THEORY_MAX_SCORE,
  THEORY_PASS_THRESHOLD,
} from '../types'
import ExamFormDrawer from '../components/ExamFormDrawer'
import ExamResultDrawer from '../components/ExamResultDrawer'

export default function ExamensPage() {
  const { hasRole } = useAuthStore()
  const canCreate   = hasRole('admin') || hasRole('secretaire')

  const [type, setType]         = useState('')
  const [status, setStatus]     = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [page, setPage]         = useState(1)

  const [formOpen, setFormOpen]       = useState(false)
  const [editExam, setEditExam]       = useState<ExamRegistration | null>(null)
  const [resultOpen, setResultOpen]   = useState(false)
  const [selectedExam, setSelected]   = useState<ExamRegistration | null>(null)

  const { data, isLoading } = useExamList({
    page, per_page: 20,
    type:      type      || undefined,
    status:    status    || undefined,
    date_from: dateFrom  || undefined,
    date_to:   dateTo    || undefined,
  })

  const deleteExam = useDeleteExam()

  const openResult = (exam: ExamRegistration) => {
    setSelected(exam)
    setResultOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examens</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? '—'} inscription{(data?.meta.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditExam(null); setFormOpen(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nouvelle inscription
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les types</option>
          {Object.entries(EXAM_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(EXAM_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Du" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Au" />
        {(type || status || dateFrom || dateTo) && (
          <button onClick={() => { setType(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : !data?.data.length ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucune inscription trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Élève</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Centre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Résultat</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.student.full_name}</td>
                    <td className="px-4 py-3 text-gray-700">{EXAM_TYPE_LABELS[exam.type]}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.scheduled_date ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {exam.center ? `${EXAM_CENTER_LABELS[exam.center]}${exam.center_city ? ` – ${exam.center_city}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {exam.score != null ? (
                        <span className={`font-medium ${exam.status === 'passed' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {exam.score}/{THEORY_MAX_SCORE}
                          <span className="text-xs text-gray-400 ml-1">(seuil {THEORY_PASS_THRESHOLD})</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={exam.status}
                        colorMap={EXAM_STATUS_COLORS}
                        labelMap={EXAM_STATUS_LABELS}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        {canCreate && exam.status === 'planned' && (
                          <>
                            <button onClick={() => openResult(exam)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                              Résultat
                            </button>
                            <button onClick={() => { setEditExam(exam); setFormOpen(true) }}
                              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                              Modifier
                            </button>
                          </>
                        )}
                        {hasRole('admin') && (
                          <button
                            onClick={() => { if (window.confirm('Supprimer cette inscription ?')) deleteExam.mutate(exam.id) }}
                            className="text-xs text-gray-400 hover:text-red-600 transition-colors">
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && (
          <div className="px-4 border-t border-gray-100">
            <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ExamFormDrawer open={formOpen} onClose={() => { setFormOpen(false); setEditExam(null) }} editExam={editExam} />
      <ExamResultDrawer open={resultOpen} onClose={() => { setResultOpen(false); setSelected(null) }} exam={selectedExam} />
    </div>
  )
}
