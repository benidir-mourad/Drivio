import { useState } from 'react'
import Pagination from '../../../shared/components/Pagination'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useLessonList } from '../hooks/usePlanning'
import type { Lesson } from '../types'
import {
  LESSON_STATUS_LABELS,
  LESSON_TYPE_COLORS,
  LESSON_TYPE_LABELS,
} from '../types'
import { formatTime } from '../utils/calendarLayout'
import LessonDetailDrawer from '../components/LessonDetailDrawer'
import LessonFormDrawer from '../components/LessonFormDrawer'

const STATUS_COLOR_MAP: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-700',
  no_show:   'bg-orange-100 text-orange-800',
}

export default function LessonsListPage() {
  const { hasRole } = useAuthStore()
  const canCreate   = hasRole('admin') || hasRole('secretaire')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [status, setStatus]     = useState('')
  const [type, setType]         = useState('')
  const [page, setPage]         = useState(1)

  const [selectedLesson, setSelected] = useState<Lesson | null>(null)
  const [detailOpen, setDetailOpen]   = useState(false)
  const [formOpen, setFormOpen]       = useState(false)
  const [editLesson, setEditLesson]   = useState<Lesson | null>(null)

  const { data, isLoading } = useLessonList({
    page,
    per_page:  20,
    date_from: dateFrom || undefined,
    date_to:   dateTo   || undefined,
    status:    status   || undefined,
    type:      type     || undefined,
  })

  const handleLessonClick = (lesson: Lesson) => {
    setSelected(lesson)
    setDetailOpen(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setEditLesson(lesson)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Séances</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? '—'} séance{(data?.meta.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditLesson(null); setFormOpen(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nouvelle séance
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Du"
          title="Du"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Au"
          title="Au"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(LESSON_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les types</option>
          {Object.entries(LESSON_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {(dateFrom || dateTo || status || type) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setStatus(''); setType(''); setPage(1) }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : !data?.data.length ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucune séance trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date & heure</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Élève</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Moniteur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Durée</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((lesson) => {
                  const colors = LESSON_TYPE_COLORS[lesson.type]
                  return (
                    <tr
                      key={lesson.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {LESSON_TYPE_LABELS[lesson.type]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium">{lesson.starts_at.slice(0, 10)}</div>
                        <div className="text-xs text-gray-400">
                          {formatTime(lesson.starts_at)} – {formatTime(lesson.ends_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lesson.student.full_name}</td>
                      <td className="px-4 py-3 text-gray-700">{lesson.instructor.full_name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {lesson.vehicle ? lesson.vehicle.plate_number : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={lesson.status}
                          colorMap={STATUS_COLOR_MAP}
                          labelMap={LESSON_STATUS_LABELS}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{lesson.duration_minutes} min</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {canCreate && lesson.status === 'scheduled' && (
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                          >
                            Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && (
          <div className="px-4 border-t border-gray-100">
            <Pagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <LessonDetailDrawer
        lesson={selectedLesson}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null) }}
        onEdit={handleEdit}
      />

      <LessonFormDrawer
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditLesson(null) }}
        editLesson={editLesson}
      />
    </div>
  )
}
