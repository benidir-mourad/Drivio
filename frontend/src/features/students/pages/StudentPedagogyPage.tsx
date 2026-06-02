import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useStudent } from '../hooks/useStudents'
import StudentExamsList from '../../examens/components/StudentExamsList'

const FILIERE_LABELS: Record<string, string> = {
  classique: 'Filière classique (20h)',
  cap:       'CAP (6h)',
}


export default function StudentPedagogyPage() {
  const { id }    = useParams<{ id: string }>()
  const numId     = Number(id)
  const navigate  = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit   = hasRole('admin') || hasRole('secretaire')

  const { data: student, isLoading } = useStudent(numId)

  if (isLoading) return <div className="py-16 text-center text-gray-400">Chargement…</div>
  if (!student)  return <div className="py-16 text-center text-gray-400">Élève introuvable.</div>

  const hoursCompleted = student.hours_completed ?? 0
  const hoursObjective = student.hours_objective ?? 20
  const hoursProgress  = Math.min(100, Math.round((hoursCompleted / hoursObjective) * 100))
  const hoursRemaining = Math.max(0, hoursObjective - hoursCompleted)
  const isReady        = hoursCompleted >= hoursObjective

  const progressColor = hoursProgress >= 100 ? '#10b981' : hoursProgress >= 60 ? '#6366f1' : '#f59e0b'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/students/${numId}`)}>← Fiche</Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
            <p className="text-sm text-gray-500">{FILIERE_LABELS[student.filiere] ?? student.filiere}</p>
          </div>
          <StatusBadge status={student.status} />
        </div>
        {canEdit && (
          <Button to={`/students/${numId}/edit`} variant="outline" size="sm">Modifier</Button>
        )}
      </div>

      {/* Hours progress card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Progression — Heures de conduite
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Filière {student.filiere === 'cap' ? 'CAP' : 'classique'} · objectif {hoursObjective}h
            </p>
          </div>
          <span className={`text-2xl font-bold ${isReady ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {hoursCompleted}h
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${hoursProgress}%`, backgroundColor: progressColor }}
          />
          {/* Tick mark at objective */}
          <div className="absolute inset-y-0 right-0 w-0.5 bg-gray-300" />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{hoursProgress}% de l'objectif atteint</span>
          <span>
            {isReady ? (
              <span className="text-emerald-600 font-medium">✓ Objectif atteint</span>
            ) : (
              `${hoursRemaining}h restantes`
            )}
          </span>
        </div>

        {/* Key indicators */}
        <dl className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <dt className="text-xs text-gray-500">Heures effectuées</dt>
            <dd className="text-2xl font-bold text-gray-900 mt-1">{hoursCompleted}</dd>
          </div>
          <div className="text-center">
            <dt className="text-xs text-gray-500">Objectif</dt>
            <dd className="text-2xl font-bold text-gray-900 mt-1">{hoursObjective}</dd>
          </div>
          <div className="text-center">
            <dt className="text-xs text-gray-500">Restantes</dt>
            <dd className={`text-2xl font-bold mt-1 ${isReady ? 'text-emerald-600' : 'text-gray-900'}`}>
              {isReady ? '✓' : hoursRemaining}
            </dd>
          </div>
        </dl>
      </div>

      {/* Student info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Informations</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Filière</dt>
            <dd className="text-gray-900">{FILIERE_LABELS[student.filiere] ?? student.filiere}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Catégorie permis</dt>
            <dd className="text-gray-900">{student.license_category}</dd>
          </div>
          {student.dossier_number && (
            <div>
              <dt className="text-gray-500">N° dossier centre</dt>
              <dd className="font-mono text-gray-900">{student.dossier_number}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Date d'inscription</dt>
            <dd className="text-gray-900">{student.enrollment_date}</dd>
          </div>
        </dl>
      </div>

      {/* Exams */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <StudentExamsList studentId={numId} />
      </div>
    </div>
  )
}
