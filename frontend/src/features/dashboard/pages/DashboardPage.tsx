import { useAuthStore } from '../../../store/authStore'

const ROLE_LABELS: Record<string, string> = {
  admin:      'Administrateur',
  secretaire: 'Secrétaire',
  moniteur:   'Moniteur',
  eleve:      'Élève',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin:      'Accès complet à toutes les fonctionnalités de gestion.',
  secretaire: 'Gestion des élèves, du planning et de la facturation.',
  moniteur:   'Votre planning, vos élèves et le suivi pédagogique.',
  eleve:      'Consultez votre planning, votre progression et vos factures.',
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const primaryRole = useAuthStore((s) => s.primaryRole)()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Bonjour, {user?.name} 👋
      </h1>
      <p className="text-gray-500 mb-8">
        {primaryRole ? ROLE_DESCRIPTIONS[primaryRole] : ''}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Rôle</p>
          <p className="text-lg font-semibold text-gray-900">
            {primaryRole ? ROLE_LABELS[primaryRole] : '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 col-span-1 sm:col-span-2 lg:col-span-2">
          <p className="text-sm font-medium text-gray-500 mb-1">Tableau de bord</p>
          <p className="text-gray-700 text-sm">
            Les widgets et statistiques seront disponibles au fil des phases.
          </p>
        </div>
      </div>
    </div>
  )
}
