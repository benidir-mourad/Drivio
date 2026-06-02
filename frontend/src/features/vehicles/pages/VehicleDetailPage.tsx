import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useVehicle } from '../hooks/useVehicles'
import { FUEL_TYPE_LABELS } from '../types'

export default function VehicleDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const numId    = Number(id)
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit  = hasRole('admin') || hasRole('secretaire')

  const { data: vehicle, isLoading } = useVehicle(numId)

  if (isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  if (!vehicle) {
    return <div className="py-16 text-center text-gray-400">Véhicule introuvable.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
          <h1 className="text-xl font-bold text-gray-900 font-mono">{vehicle.plate_number}</h1>
          <StatusBadge status={vehicle.status} />
        </div>
        {canEdit && (
          <Button to={`/vehicles/${vehicle.id}/edit`} variant="outline">
            Modifier
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Informations
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Marque" value={vehicle.brand} />
          <InfoRow label="Modèle" value={vehicle.model} />
          <InfoRow label="Année" value={String(vehicle.year)} />
          <InfoRow label="Catégorie permis" value={vehicle.license_category} />
          <InfoRow label="Carburant" value={FUEL_TYPE_LABELS[vehicle.fuel_type]} />
          <InfoRow
            label="Kilométrage"
            value={vehicle.mileage != null ? `${vehicle.mileage.toLocaleString('fr-FR')} km` : null}
          />
          {vehicle.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">Notes</dt>
              <dd className="text-gray-900 mt-0.5 whitespace-pre-wrap">{vehicle.notes}</dd>
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
