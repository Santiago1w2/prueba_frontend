import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'CONSOLA' },
  { to: '/tropels', label: 'TROPELES' },
  { to: '/signals', label: 'SEÑALES' },
  { to: '/sectors', label: 'SECTORES' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-void text-text-primary font-sans">
      {/* Top nav */}
      <header className="bg-panel border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <span className="font-mono text-accent font-bold text-sm tracking-widest">
              TROPELCARE
            </span>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-text-dim font-mono text-xs hidden sm:block">
              {user?.teamCode}
            </span>
            <button
              onClick={logout}
              className="text-text-secondary hover:text-danger font-mono text-xs transition-colors"
            >
              SALIR
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex border-t border-border overflow-x-auto">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 font-mono text-xs whitespace-nowrap transition-colors ${
                  isActive ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
