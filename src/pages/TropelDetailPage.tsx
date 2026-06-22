import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTropel } from '@/api/resources'
import type { Tropel } from '@/types/api'
import { ApiRequestError } from '@/api/client'

const VITAL_COLORS: Record<string, string> = {
  ESTABLE: 'text-stable',
  HAMBRIENTO: 'text-warn',
  AGITADO: 'text-accent',
  MUTANDO: 'text-purple-400',
  CRITICO: 'text-danger',
}

export default function TropelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tropel, setTropel] = useState<Tropel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getTropel(id)
      .then(setTropel)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar tropel')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-6 w-32 bg-surface rounded animate-pulse" />
        <div className="bg-panel border border-border rounded-lg p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 bg-surface rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/tropels" className="text-accent font-mono text-xs hover:underline">
          ← Volver al Atlas
        </Link>
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
          <p className="text-danger font-mono text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!tropel) return null

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/tropels" className="text-accent font-mono text-xs hover:underline">
        ← Volver al Atlas
      </Link>

      <div className="bg-panel border border-border rounded-lg p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-text-primary">{tropel.name}</h1>
            <p className="text-text-dim font-mono text-xs mt-1">{tropel.id}</p>
          </div>
          <span className={`font-mono text-sm font-bold ${VITAL_COLORS[tropel.vitalState]}`}>
            {tropel.vitalState}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Especie', value: tropel.species },
            { label: 'Guardián', value: tropel.guardianName },
            { label: 'Sector', value: `${tropel.sector.name} (${tropel.sector.sectorCode})` },
            { label: 'Etapa de mutación', value: String(tropel.mutationStage) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded p-3">
              <p className="text-text-dim font-mono text-xs uppercase">{label}</p>
              <p className="text-text-primary font-mono text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Meters */}
        <div className="space-y-3">
          {[
            { label: 'Nivel de Energía', value: tropel.energyLevel, color: 'bg-accent' },
            { label: 'Índice de Caos', value: tropel.chaosIndex, color: 'bg-warn' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-text-secondary">{label}</span>
                <span className="font-mono text-xs text-text-dim">{value}/100</span>
              </div>
              <div className="bg-surface rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-text-dim font-mono text-xs">
          Actualizado: {new Date(tropel.updatedAt).toLocaleString('es-PE')}
        </p>
      </div>

      <Link
        to={`/sectors/${tropel.sector.id}/story`}
        className="inline-block bg-panel border border-border hover:border-accent rounded-lg px-4 py-2 font-mono text-xs text-text-secondary hover:text-accent transition-colors"
      >
        Ver historia del sector {tropel.sector.name} →
      </Link>
    </div>
  )
}
