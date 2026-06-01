import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authApi } from './features/auth/api/authApi'
import ProtectedRoute from './shared/components/ProtectedRoute'
import AppLayout from './shared/layout/AppLayout'

const LoginPage    = lazy(() => import('./features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Chargement…
    </div>
  )
}

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    authApi.me()
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Routes des phases suivantes seront ajoutées ici */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
