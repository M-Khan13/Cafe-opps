import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coffee } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate(user.role === 'admin' ? '/admin' : '/staff')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT — editorial hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-espresso border-r border-border-warm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber">
            <Coffee className="h-5 w-5 text-espresso" />
          </div>
          <span className="font-serif text-xl font-semibold text-cream">Café Ops</span>
        </div>

        <div className="max-w-md">
          <p className="text-xs uppercase tracking-widest text-amber mb-6">The House System</p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-cream mb-6">
            Run the floor like the back of a beautiful menu.
          </h1>
          <p className="text-muted leading-relaxed">
            Orders, tasks, and the day's menu — one warm, quiet place for the whole team to work from.
          </p>
        </div>

        <p className="text-sm text-muted">Est. 2026 · Service, refined.</p>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-4xl font-semibold text-cream mb-2">Welcome back</h2>
          <p className="text-muted mb-8">Sign in to your account.</p>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-cream">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@cafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-cream">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button
              className="w-full bg-amber text-espresso hover:bg-amber-dark font-medium"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login