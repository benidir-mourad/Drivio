import { Navigate } from 'react-router-dom'
import { useAuthStore, type Role } from '../../store/authStore'
import { homeFor } from '../utils/roles'

interface Props {
  children: React.ReactNode
  roles?: Role[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Chargement…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles) {
    const primary = useAuthStore.getState().primaryRole()
    const hasAccess = roles.some((r) => user.roles.includes(r))
    if (!hasAccess) return <Navigate to={homeFor(primary)} replace />
  }

  return <>{children}</>
}
