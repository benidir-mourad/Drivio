import { useState } from 'react'
import Button from '../../../shared/components/Button'
import { useRecordResult } from '../hooks/useExamens'
import { THEORY_MAX_SCORE, THEORY_PASS_THRESHOLD, type ExamRegistration } from '../types'

interface Props {
  exam: ExamRegistration | null
  open: boolean
  onClose: () => void
}

type ResultStatus = 'passed' | 'failed' | 'absent' | 'cancelled'

export default function ExamResultDrawer({ exam, open, onClose }: Props) {
  const [resultStatus, setResultStatus] = useState<ResultStatus>('passed')
  const [score, setScore]               = useState('')
  const [notes, setNotes]               = useState('')

  const recordResult = useRecordResult(exam?.id ?? 0)

  if (!open || !exam) return null

  const isTheory    = exam.is_theory
  const scoreNum    = score !== '' ? parseFloat(score) : null
  const passedByScore = isTheory && scoreNum !== null ? scoreNum >= THEORY_PASS_THRESHOLD : null

  const handleSubmit = () => {
    recordResult.mutate(
      {
        status: resultStatus,
        score:  resultStatus !== 'absent' && resultStatus !== 'cancelled' && isTheory
          ? scoreNum
          : null,
        notes: notes || undefined,
      },
      { onSuccess: () => { onClose(); setScore(''); setNotes('') } }
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-40 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Enregistrer le résultat</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Fermer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Exam summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-semibold text-gray-900">{exam.student.full_name}</p>
            <p className="text-gray-600">{exam.scheduled_date} · {exam.type}</p>
            {exam.center_city && <p className="text-gray-500">{exam.center_city}</p>}
          </div>

          {/* Result status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Résultat</label>
            <div className="grid grid-cols-2 gap-2">
              {(['passed', 'failed', 'absent', 'cancelled'] as ResultStatus[]).map((s) => {
                const labels: Record<ResultStatus, string> = {
                  passed:    '✓ Réussi',
                  failed:    '✗ Échoué',
                  absent:    '○ Absent',
                  cancelled: '— Annulé',
                }
                const active: Record<ResultStatus, string> = {
                  passed:    'bg-emerald-600 text-white border-emerald-600',
                  failed:    'bg-red-600 text-white border-red-600',
                  absent:    'bg-orange-500 text-white border-orange-500',
                  cancelled: 'bg-gray-500 text-white border-gray-500',
                }
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setResultStatus(s)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      resultStatus === s ? active[s] : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Score (theory only, when passed or failed) */}
          {isTheory && (resultStatus === 'passed' || resultStatus === 'failed') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score <span className="text-gray-400">(sur {THEORY_MAX_SCORE}, seuil {THEORY_PASS_THRESHOLD})</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={THEORY_MAX_SCORE}
                  step={0.5}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                  placeholder={`0–${THEORY_MAX_SCORE}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  /{THEORY_MAX_SCORE}
                </span>
              </div>
              {/* Visual pass/fail indicator */}
              {scoreNum !== null && (
                <p className={`mt-1 text-xs font-medium ${passedByScore ? 'text-emerald-600' : 'text-red-600'}`}>
                  {passedByScore
                    ? `✓ Score suffisant (${scoreNum} ≥ ${THEORY_PASS_THRESHOLD})`
                    : `✗ Score insuffisant (${scoreNum} < ${THEORY_PASS_THRESHOLD})`}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarques (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Observations particulières…"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
          <Button type="button" loading={recordResult.isPending} onClick={handleSubmit}>
            Confirmer le résultat
          </Button>
          <Button variant="secondary" onClick={onClose} type="button">Annuler</Button>
        </div>
      </div>
    </>
  )
}
