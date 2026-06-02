import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/StatusBadge'
import { useAuthStore } from '../../../store/authStore'
import {
  useDeleteStudentDocument,
  useStudent,
  useUploadStudentDocument,
} from '../hooks/useStudents'
import { DOCUMENT_TYPE_LABELS, type DocumentType } from '../types'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numId  = Number(id)
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canEdit = hasRole('admin') || hasRole('secretaire')

  const { data: student, isLoading } = useStudent(numId)
  const uploadDoc  = useUploadStudentDocument(numId)
  const deleteDoc  = useDeleteStudentDocument(numId)

  const fileRef = useRef<HTMLInputElement>(null)
  const [docType, setDocType] = useState<DocumentType>('identity_card')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('type', docType)
    fd.append('file', file)
    uploadDoc.mutate(fd)
    e.target.value = ''
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-400">Chargement…</div>
  }

  if (!student) {
    return <div className="py-16 text-center text-gray-400">Élève introuvable.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Retour</Button>
          <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
          <StatusBadge status={student.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button to={`/students/${student.id}/pedagogy`} variant="secondary" size="sm">
            Pédagogie
          </Button>
          {canEdit && (
            <Button to={`/students/${student.id}/edit`} variant="outline" size="sm">
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Informations
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Téléphone" value={student.phone} />
          <InfoRow label="Date de naissance" value={student.date_of_birth} />
          <InfoRow label="Catégorie permis" value={student.license_category} />
          <InfoRow label="Date d'inscription" value={student.enrollment_date} />
          <InfoRow label="Adresse" value={student.address} />
          {student.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">Notes</dt>
              <dd className="text-gray-900 mt-0.5 whitespace-pre-wrap">{student.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Documents ({student.documents?.length ?? 0})
          </h2>
          {canEdit && (
            <div className="flex items-center gap-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="text-sm px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                loading={uploadDoc.isPending}
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                Ajouter
              </Button>
            </div>
          )}
        </div>

        {!student.documents?.length ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aucun document.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {student.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {DOCUMENT_TYPE_LABELS[doc.type]} · {doc.created_at?.slice(0, 10)}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer ce document ?')) {
                        deleteDoc.mutate(doc.id)
                      }
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
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
