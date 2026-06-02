import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Pagination from '../../../shared/components/Pagination'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useDeleteVehicle, useVehicleList } from '../hooks/useVehicles'
import { FUEL_TYPE_LABELS, VEHICLE_LICENSE_CATEGORIES } from '../types'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit = hasRole('admin') || hasRole('secretaire')

  const [search, setSearch]      = useState('')
  const [debouncedSearch, setDS] = useState('')
  const [status, setStatus]      = useState('')
  const [category, setCategory]  = useState('')
  const [page, setPage]          = useState(1)

  useEffect(() => {
    const t = setTimeout(() => { setDS(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useVehicleList({
    page,
    per_page: 15,
    search: debouncedSearch || undefined,
    status: status || undefined,
    license_category: category || undefined,
  })

  const deleteVehicle = useDeleteVehicle()

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Supprimer le véhicule "${name}" ?`)) return
    deleteVehicle.mutate(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Véhicules</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? '—'} véhicule{(data?.meta.total ?? 0) !== 1 ? 's' : ''} au total
          </p>
        </div>
        {canEdit && (
          <Button to="/vehicles/new">Nouveau véhicule</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retiré</option>
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Toutes catégories</option>
          {VEHICLE_LICENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : !data?.data.length ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucun véhicule trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Immatriculation</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Année</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Carburant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/vehicles/${v.id}`}
                        className="font-mono font-medium text-indigo-600 hover:underline"
                      >
                        {v.plate_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.brand} {v.model}</td>
                    <td className="px-4 py-3 text-gray-600">{v.year}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {v.license_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{FUEL_TYPE_LABELS[v.fuel_type]}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                          className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          Voir
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              Modifier
                            </button>
                            {hasRole('admin') && (
                              <button
                                onClick={() =>
                                  handleDelete(v.id, `${v.brand} ${v.model} ${v.plate_number}`)
                                }
                                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                              >
                                Supprimer
                              </button>
                            )}
                          </>
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
            <Pagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
