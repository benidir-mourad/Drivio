import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authApi } from './features/auth/api/authApi'
import ProtectedRoute from './shared/components/ProtectedRoute'
import AppLayout from './shared/layout/AppLayout'

const LoginPage              = lazy(() => import('./features/auth/pages/LoginPage'))
const DashboardPage          = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const StudentsPage           = lazy(() => import('./features/students/pages/StudentsPage'))
const StudentFormPage        = lazy(() => import('./features/students/pages/StudentFormPage'))
const StudentDetailPage      = lazy(() => import('./features/students/pages/StudentDetailPage'))
const StudentPedagogyPage    = lazy(() => import('./features/students/pages/StudentPedagogyPage'))
const InstructorsPage        = lazy(() => import('./features/instructors/pages/InstructorsPage'))
const InstructorFormPage     = lazy(() => import('./features/instructors/pages/InstructorFormPage'))
const InstructorDetailPage   = lazy(() => import('./features/instructors/pages/InstructorDetailPage'))
const VehiclesPage           = lazy(() => import('./features/vehicles/pages/VehiclesPage'))
const VehicleFormPage        = lazy(() => import('./features/vehicles/pages/VehicleFormPage'))
const VehicleDetailPage      = lazy(() => import('./features/vehicles/pages/VehicleDetailPage'))
const PlanningPage           = lazy(() => import('./features/planning/pages/PlanningPage'))
const LessonsListPage        = lazy(() => import('./features/planning/pages/LessonsListPage'))
const ExamensPage            = lazy(() => import('./features/examens/pages/ExamensPage'))
const ExamenStatsPage        = lazy(() => import('./features/examens/pages/ExamenStatsPage'))

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

          {/* Students */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/new" element={<StudentFormPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="students/:id/edit" element={<StudentFormPage />} />
          <Route path="students/:id/pedagogy" element={<StudentPedagogyPage />} />

          {/* Instructors */}
          <Route path="instructors" element={<InstructorsPage />} />
          <Route path="instructors/new" element={<InstructorFormPage />} />
          <Route path="instructors/:id" element={<InstructorDetailPage />} />
          <Route path="instructors/:id/edit" element={<InstructorFormPage />} />

          {/* Vehicles */}
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />

          {/* Planning */}
          <Route path="planning" element={<PlanningPage />} />
          <Route path="planning/lessons" element={<LessonsListPage />} />

          {/* Examens */}
          <Route path="examens" element={<ExamensPage />} />
          <Route path="examens/stats" element={<ExamenStatsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
