import { useState } from 'react'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useCancelLesson, useCompleteLesson, useDeleteLesson, useMarkNoShow } from '../hooks/usePlanning'
import { LESSON_TYPE_COLORS, LESSON_TYPE_LABELS, LESSON_STATUS_LABELS, type Lesson } from '../types'
import { formatTime } from '../utils/calendarLayout'

interface Props {
  lesson: Lesson | null
  open: boolean
  onClose: () => void
  onEdit: (lesson: Lesson) => void
}

const STATUS_COLOR_MAP: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-700',
  no_show:   'bg-orange-100 text-orange-800',
}

export default function LessonDetailDrawer({ lesson, open, onClose, onEdit }: Props) {
  const { hasRole } = useAuthStore()
  const canManage   = hasRole('admin') || hasRole('secretaire')
  const isMoniteur  = hasRole('moniteur')

  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)

  const cancelLesson   = useCancelLesson()
  const completeLesson = useCompleteLesson()
  const markNoShow     = useMarkNoShow()
  const deleteLesson   = useDeleteLesson()

  if (!open || !lesson) return null

  const colors   = LESSON_TYPE_COLORS[lesson.type]
  const isActive = lesson.status === 'scheduled'

  const handleCancel = () => {
    cancelLesson.mutate(
      { id: lesson.id, reason: cancelReason || undefined },
      { onSuccess: () => { onClose(); setShowCancelForm(false); setCancelReason('') } }
    )
  }

  const handleComplete = () => {
    completeLesson.mutate(lesson.id, { onSuccess: onClose })
  }

  const handleNoShow = () => {
    markNoShow.mutate(lesson.id, { onSuccess: onClose })
  }

  const handleDelete = () => {
    if (!window.confirm('Supprimer définitivement cette séance ?')) return
    deleteLesson.mutate(lesson.id, { onSuccess: onClose })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-40 flex flex-col">
        {/* Colored header band */}
        <div className={`px-6 py-5 ${colors.bg} border-b-2 ${colors.border}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                {LESSON_TYPE_LABELS[lesson.type]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:bg-white/50 transition-colors"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <p className="text-xl font-bold text-gray-900">{lesson.student.full_name}</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {lesson.starts_at.slice(0, 10)} · {formatTime(lesson.starts_at)} – {formatTime(lesson.ends_at)}
            <span className="ml-2 text-gray-400">({lesson.duration_minutes} min)</span>
          </p>
          <div className="mt-2">
            <StatusBadge
              status={lesson.status}
              colorMap={STATUS_COLOR_MAP}
              labelMap={LESSON_STATUS_LABELS}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Moniteur</dt>
              <dd className="font-medium text-gray-900">{lesson.instructor.full_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Véhicule</dt>
              <dd className="font-medium text-gray-900">
                {lesson.vehicle
                  ? `${lesson.vehicle.plate_number} — ${lesson.vehicle.brand}`
                  : <span className="text-gray-400">Aucun</span>}
              </dd>
            </div>
          </dl>

          {lesson.notes && (
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.notes}</p>
            </div>
          )}

          {lesson.cancellation_reason && (
            <div className="bg-red-50 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-red-500 mb-1">Motif d'annulation</p>
              <p className="text-sm text-red-700">{lesson.cancellation_reason}</p>
            </div>
          )}

          {/* Cancel form */}
          {showCancelForm && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Motif d'annulation (optionnel)</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Ex : Absence de l'élève, indisponibilité…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancelLesson.isPending}
                  onClick={handleCancel}
                  type="button"
                >
                  Confirmer l'annulation
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelForm(false)}
                  type="button"
                >
                  Retour
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {isActive && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            {(canManage || isMoniteur) && !showCancelForm && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  size="sm"
                  loading={completeLesson.isPending}
                  onClick={handleComplete}
                  type="button"
                >
                  Marquer effectuée
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={markNoShow.isPending}
                  onClick={handleNoShow}
                  type="button"
                >
                  Absence élève
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowCancelForm(true)}
                  type="button"
                >
                  Annuler
                </Button>
              </div>
            )}

            {canManage && !showCancelForm && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onEdit(lesson); onClose() }}
                  type="button"
                >
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deleteLesson.isPending}
                  onClick={handleDelete}
                  type="button"
                >
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit only (non-active lessons) */}
        {!isActive && canManage && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              loading={deleteLesson.isPending}
              onClick={handleDelete}
              type="button"
            >
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
