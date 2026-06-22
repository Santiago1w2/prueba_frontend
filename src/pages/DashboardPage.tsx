import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '@/api/resources'
import type { DashboardSummary } from '@/types/api'
import { ApiRequestError } from '@/api/client'

const SEVERITY_COLORS: Record<string, string> = {
  LEVE: 'text-stable',
  MODERADO: 'text-accent',
  GRAVE: 'text-warn',
  CRITICO: 'text-danger',
}

function KpiCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <p className="text-text-dim font-mono text-xs uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`font-mono text-3xl font-bold ${accent ? 'text-danger' : 'text-text-primary'}`}
      >
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiRequestError) setError(err.message)
        else setError('Error al cargar el dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-surface rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-panel border border-border rounded-lg p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
        <p className="text-danger font-mono text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-text-secondary hover:text-text-primary font-mono text-xs underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) return null

  const severities = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'] as const
  const maxSeverity = Math.max(...severities.map((s) => data.signalsBySeverity[s] ?? 0))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-text-primary">
            Control Room
          </h1>
          <p className="text-text-dim font-mono text-xs mt-0.5">
            Actualizado: {new Date(data.generatedAt).toLocaleTimeString('es-PE')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-stable animate-pulse" />
          <span className="text-stable font-mono text-xs">SISTEMA ACTIVO</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Tropeles" value={data.totalTropels} />
        <KpiCard label="Tropeles Críticos" value={data.criticalTropels} accent />
        <KpiCard label="Señales Abiertas" value={data.openSignals} />
        <KpiCard
          label="Estabilidad Promedio"
          value={`${Math.round(data.sectorStabilityAvg)}%`}
        />
      </div>

      {/* Severity breakdown */}
      <div className="bg-panel border border-border rounded-lg p-6">
        <h2 className="font-mono text-sm font-bold text-text-secondary uppercase tracking-widest mb-5">
          Señales por Severidad
        </h2>
        <div className="space-y-3">
          {severities.map((s) => {
            const count = data.signalsBySeverity[s] ?? 0
            const pct = maxSeverity > 0 ? (count / maxSeverity) * 100 : 0
            return (
              <div key={s} className="flex items-center gap-3">
                <span
                  className={`font-mono text-xs w-20 text-right ${SEVERITY_COLORS[s]}`}
                >
                  {s}
                </span>
                <div className="flex-1 bg-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      s === 'LEVE'
                        ? 'bg-stable'
                        : s === 'MODERADO'
                          ? 'bg-accent'
                          : s === 'GRAVE'
                            ? 'bg-warn'
                            : 'bg-danger'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-text-dim w-10">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/tropels', label: 'Atlas de Tropeles', desc: 'Buscar y filtrar criaturas' },
          { to: '/signals', label: 'Feed de Señales', desc: 'Atender señales activas' },
          { to: '/sectors', label: 'Sectores', desc: 'Explorar historias de sector' },
        ].map(({ to, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-panel border border-border hover:border-accent rounded-lg p-4 transition-colors group"
          >
            <p className="font-mono text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
              {label}
            </p>
            <p className="text-text-dim font-mono text-xs mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
