import { useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { Coffee, LogOut, Menu, X } from 'lucide-react'

function Layout({ navItems, roleLabel }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="min-h-screen flex bg-espresso text-cream">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-border-warm bg-espresso px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber">
            <Coffee className="h-4 w-4 text-espresso" />
          </div>
          <span className="font-serif text-lg font-semibold">Café Ops</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-1">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop (mobile only, when open) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 h-screen w-64 shrink-0 flex flex-col
          border-r border-border-warm bg-espresso p-4
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-muted"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber">
            <Coffee className="h-5 w-5 text-espresso" />
          </div>
          <span className="font-serif text-lg font-semibold">Café Ops</span>
        </div>

        {roleLabel && (
          <p className="px-2 mb-2 text-xs uppercase tracking-widest text-muted">
            {roleLabel}
          </p>
        )}

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-surface-2 text-cream font-medium'
                    : 'text-muted hover:text-cream hover:bg-surface'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border-warm">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber text-amber text-xs font-medium">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg border border-border-warm px-3 py-2.5 text-sm text-muted hover:text-cream hover:bg-surface transition"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout