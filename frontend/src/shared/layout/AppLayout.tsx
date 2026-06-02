import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore, type Role } from '../../store/authStore'
import { authApi } from '../../features/auth/api/authApi'
import { ACCESS } from '../utils/roles'

interface NavItem {
  to: string
  label: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',   label: 'Tableau de bord', roles: ['admin', 'secretaire', 'moniteur', 'eleve'] },
  { to: '/students',    label: 'Élèves',           roles: ACCESS.students },
  { to: '/instructors', label: 'Moniteurs',        roles: ACCESS.instructors },
  { to: '/vehicles',    label: 'Véhicules',        roles: ACCESS.vehicles },
  { to: '/planning',          label: 'Planning',  roles: ACCESS.planning },
  { to: '/planning/lessons',  label: 'Séances',   roles: ACCESS.planning },
  { to: '/pedagogy',    label: 'Pédagogie',         roles: ACCESS.pedagogy },
  { to: '/finance',     label: 'Facturation',       roles: ACCESS.finance },
  { to: '/settings',    label: 'Paramètres',        roles: ACCESS.settings },
]

export default function AppLayout() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { mutate: logout } = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setUser(null)
      navigate('/login', { replace: true })
    },
  })

  const visibleItems = NAV_ITEMS.filter(
    (item) => user?.roles.some((r) => item.roles.includes(r)),
  )

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const sidebar = (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-200">
        <Link to="/dashboard" className="text-xl font-bold text-indigo-600">Drivio</Link>
      </div>
      <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={navLinkClass} end={item.to === '/dashboard'}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.roles[0]}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full text-left text-sm text-gray-600 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-gray-200">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-white border-r border-gray-200 z-50">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
          <span className="font-semibold text-gray-900">Drivio</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
