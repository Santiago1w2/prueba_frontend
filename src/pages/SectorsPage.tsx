import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSectors } from '@/api/resources'
import type { Sector } from '@/types/api'
import { ApiRequestError } from '@/api/client'

const CLIMATE_LABELS: Record<string, string> = {
  PIXEL_FOREST: '🌿 Pixel Forest',
  NEON_CAVE: '💜 Neon Cave',
  CLOUD_AQUARIUM: '🌊 Cloud Aquarium',
  RETRO_ARCADE: '🕹️ Retro Arcade',
}

const CLIMATE_COLORS: Record<string, string> = {
  PIXEL_FOREST: 'border-stable/40 hover:border-stable',
  NEON_CAVE: 'border-purple-500/40 hover:border-purple-500',
  CLOUD_AQUARIUM: 'border-accent/40 hover:border-accent',
  RETRO_ARCADE: 'border-warn/40 hover:border-warn',
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSectors()
      .then((s) => setSectors(s.items))
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar sectores')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-panel border border-border rounded-lg p-5 h-36 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
        <p className="text-danger font-mono text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-mono text-xl font-bold text-text-primary">Sectores</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => {
          const loadPct = sector.capacity > 0 ? (sector.currentLoad / sector.capacity) * 100 : 0
          return (
            <Link
              key={sector.id}
              to={`/sectors/${sector.id}/story`}
              className={`bg-panel border rounded-lg p-5 transition-colors group ${CLIMATE_COLORS[sector.climate] ?? 'border-border hover:border-accent'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-text-dim">{sector.sectorCode}</p>
                  <h2 className="font-mono text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                    {sector.name}
                  </h2>
                </div>
                <span className="font-mono text-xs text-text-dim">
                  {CLIMATE_LABELS[sector.climate]}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-mono text-xs text-text-dim">Carga</span>
                    <span className="font-mono text-xs text-text-dim">
                      {sector.currentLoad}/{sector.capacity}
                    </span>
                  </div>
                  <div className="bg-surface rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${loadPct > 80 ? 'bg-danger' : loadPct > 60 ? 'bg-warn' : 'bg-stable'}`}
                      style={{ width: `${Math.min(loadPct, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-mono text-xs text-text-dim">Estabilidad</span>
                    <span className="font-mono text-xs text-text-dim">{sector.stabilityLevel}%</span>
                  </div>
                  <div className="bg-surface rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all"
                      style={{ width: `${sector.stabilityLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-accent font-mono text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver historia del sector →
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
