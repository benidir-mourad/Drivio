import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Pagination from '../../../shared/components/Pagination'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import { useDeleteStudent, useStudentList } from '../hooks/useStudents'
import { LICENSE_CATEGORIES } from '../types'

export default function StudentsPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit = hasRole('admin') || hasRole('secretaire')

  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDS]    = useState('')
  const [status, setStatus]         = useState('')
  const [category, setCategory]     = useState('')
  const [page, setPage]             = useState(1)

  useEffect(() => {
    const t = setTimeout(() => { setDS(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useStudentList({
    page,
    per_page: 15,
    search: debouncedSearch || undefined,
    status: status || undefined,
    license_category: category || undefined,
  })

  const deleteStudent = useDeleteStudent()

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Supprimer l'élève "${name}" ?`)) return
    deleteStudent.mutate(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Élèves</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? '—'} élève{(data?.meta.total ?? 0) !== 1 ? 's' : ''} au total
          </p>
        </div>
        {canEdit && (
          <Button to="/students/new">Nouvel élève</Button>
        )}
      </div>

      {/* Filters */}
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
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="graduated">Diplômé</option>
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Toutes catégories</option>
          {LICENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : !data?.data.length ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucun élève trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Inscription</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/students/${s.id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {s.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {s.license_category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.enrollment_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          Voir
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => navigate(`/students/${s.id}/edit`)}
                              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              Modifier
                            </button>
                            {hasRole('admin') && (
                              <button
                                onClick={() => handleDelete(s.id, s.full_name)}
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
