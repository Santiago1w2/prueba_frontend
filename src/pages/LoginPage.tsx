import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext'
import { ApiRequestError } from '@/api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const [teamCode, setTeamCode] = useState(import.meta.env.VITE_TEAM_CODE ?? '')
  const [email, setEmail] = useState(import.meta.env.VITE_EMAIL ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(teamCode, email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Error de conexión. Verifica la URL del backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-accent font-mono text-xs tracking-[0.3em] mb-2 uppercase">
            TUCKERSOFT / SISTEMA OPERATIVO
          </p>
          <h1 className="text-text-primary font-mono text-3xl font-bold">
            TropelCare
          </h1>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Control Room — Pizza Protocol
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel border border-border rounded-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-text-secondary font-mono text-xs uppercase tracking-widest">
              Autenticación de Operador
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-secondary font-mono text-xs mb-1 uppercase">
                Team Code
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="TEAM-001"
                required
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-text-secondary font-mono text-xs mb-1 uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@tuckersoft.com"
                required
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-text-secondary font-mono text-xs mb-1 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded px-3 py-2">
                <p className="text-danger font-mono text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-void font-mono font-bold text-sm py-2.5 rounded transition-opacity disabled:opacity-50 hover:opacity-90 mt-2"
            >
              {loading ? 'CONECTANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-dim font-mono text-xs mt-4">
          v1.0.0 — Sector Operativo Activo
        </p>
      </div>
    </div>
  )
}
