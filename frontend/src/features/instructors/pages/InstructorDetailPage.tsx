import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useInstructor } from '../hooks/useInstructors'

export default function InstructorDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const numId    = Number(id)
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit  = hasRole('admin') || hasRole('secretaire')

  const { data: instructor, isLoading } = useInstructor(numId)

  if (isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  if (!instructor) {
    return <div className="py-16 text-center text-gray-400">Moniteur introuvable.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
          <h1 className="text-xl font-bold text-gray-900">{instructor.full_name}</h1>
          <StatusBadge status={instructor.status} />
        </div>
        {canEdit && (
          <Button to={`/instructors/${instructor.id}/edit`} variant="outline">
            Modifier
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Informations
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Email" value={instructor.email} />
          <InfoRow label="Téléphone" value={instructor.phone} />
          <InfoRow label="N° agrément" value={instructor.license_number} />
          <InfoRow label="Date d'embauche" value={instructor.hire_date} />
          {instructor.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">Notes</dt>
              <dd className="text-gray-900 mt-0.5 whitespace-pre-wrap">{instructor.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 mt-0.5">{value ?? '—'}</dd>
    </div>
  )
}
