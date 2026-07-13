import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Layout({ children }) {
  const navigate = useNavigate()
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">Café Ops</span>
          {user && (
            <span className="text-sm text-zinc-400">
              {user.name} · {user.role}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}

export default Layout
