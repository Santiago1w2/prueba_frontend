import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getTropels, getSectors } from '@/api/resources'
import type { TropelPage, Sector, Species, VitalState, SortOption } from '@/types/api'
import { ApiRequestError } from '@/api/client'
import { useUrlState } from '@/hooks/useUrlState'

const VITAL_COLORS: Record<VitalState, string> = {
  ESTABLE: 'text-stable',
  HAMBRIENTO: 'text-warn',
  AGITADO: 'text-accent',
  MUTANDO: 'text-purple-400',
  CRITICO: 'text-danger',
}

const SPECIES_LIST: Species[] = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY']
const VITAL_LIST: VitalState[] = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO']
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'updatedAt,desc', label: 'Más reciente' },
  { value: 'name,asc', label: 'Nombre A→Z' },
  { value: 'chaosIndex,desc', label: 'Mayor caos' },
]

const DEFAULTS = {
  page: 0,
  size: 20 as 20,
  species: '' as string,
  vitalState: '' as string,
  sectorId: '' as string,
  q: '' as string,
  sort: 'updatedAt,desc' as string,
}

export default function TropelsPage() {
  const [urlState, setUrlState] = useUrlState(DEFAULTS)
  const [data, setData] = useState<TropelPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [qInput, setQInput] = useState(urlState.q)

  // Track request version to discard stale responses
  const reqVersion = useRef(0)

  const fetchTropels = useCallback(async () => {
    const version = ++reqVersion.current
    setLoading(true)
    setError(null)
    try {
      const result = await getTropels({
        page: urlState.page,
        size: urlState.size as 20,
        species: (urlState.species as Species) || undefined,
        vitalState: (urlState.vitalState as VitalState) || undefined,
        sectorId: urlState.sectorId || undefined,
        q: urlState.q || undefined,
        sort: (urlState.sort as SortOption) || 'updatedAt,desc',
      })
      if (version !== reqVersion.current) return // stale
      setData(result)
    } catch (err) {
      if (version !== reqVersion.current) return
      setError(err instanceof ApiRequestError ? err.message : 'Error al cargar tropeles')
    } finally {
      if (version === reqVersion.current) setLoading(false)
    }
  }, [urlState.page, urlState.size, urlState.species, urlState.vitalState, urlState.sectorId, urlState.q, urlState.sort])

  useEffect(() => { fetchTropels() }, [fetchTropels])

  useEffect(() => {
    getSectors().then((s) => setSectors(s.items)).catch(() => {})
  }, [])

  function handleFilterChange(key: keyof typeof DEFAULTS, value: string) {
    setUrlState({ [key]: value, page: 0 } as Partial<typeof DEFAULTS>)
  }

  function handleSearch() {
    setUrlState({ q: qInput, page: 0 })
  }

  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-xl font-bold text-text-primary">Atlas de Tropeles</h1>
        <p className="text-text-dim font-mono text-xs mt-0.5">
          {data ? `${data.totalElements} criaturas encontradas` : '—'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nombre..."
            maxLength={80}
            className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleSearch}
            className="bg-accent text-void font-mono text-xs font-bold px-4 py-1.5 rounded hover:opacity-90 transition-opacity"
          >
            BUSCAR
          </button>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap gap-2">
          <select
            value={urlState.species}
            onChange={(e) => handleFilterChange('species', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Todas las especies</option>
            {SPECIES_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={urlState.vitalState}
            onChange={(e) => handleFilterChange('vitalState', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Todos los estados</option>
            {VITAL_LIST.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          <select
            value={urlState.sectorId}
            onChange={(e) => handleFilterChange('sectorId', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Todos los sectores</option>
            {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select
            value={urlState.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={String(urlState.size)}
            onChange={(e) => setUrlState({ size: Number(e.target.value) as 20, page: 0 })}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>
      </div>

      {/* Table area — fixed min-height to prevent layout shift */}
      <div className="min-h-[400px]">
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex justify-between items-center">
            <p className="text-danger font-mono text-sm">{error}</p>
            <button onClick={fetchTropels} className="text-text-secondary font-mono text-xs underline">
              Reintentar
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-panel border border-border rounded h-12 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !error && data?.content.length === 0 && (
          <div className="bg-panel border border-border rounded-lg p-12 text-center">
            <p className="text-text-dim font-mono text-sm">
              No se encontraron tropeles con estos filtros.
            </p>
          </div>
        )}

        {!loading && !error && data && data.content.length > 0 && (
          <div className="bg-panel border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Nombre', 'Especie', 'Estado vital', 'Energía', 'Caos', 'Sector'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-text-dim font-mono text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/tropels/${t.id}`}
                        className="font-mono text-sm text-accent hover:underline"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{t.species}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${VITAL_COLORS[t.vitalState]}`}>
                        {t.vitalState}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-surface rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-accent"
                            style={{ width: `${t.energyLevel}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-text-dim">{t.energyLevel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-warn">{t.chaosIndex}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{t.sector.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-text-dim">
            Página {data.currentPage + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setUrlState({ page: urlState.page - 1 })}
              disabled={urlState.page === 0}
              className="px-3 py-1 bg-panel border border-border rounded font-mono text-xs disabled:opacity-30 hover:border-accent transition-colors"
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(0, Math.min(urlState.page - 3, totalPages - 7))
              const p = start + i
              return (
                <button
                  key={p}
                  onClick={() => setUrlState({ page: p })}
                  className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                    p === urlState.page
                      ? 'bg-accent text-void font-bold'
                      : 'bg-panel border border-border hover:border-accent'
                  }`}
                >
                  {p + 1}
                </button>
              )
            })}
            <button
              onClick={() => setUrlState({ page: urlState.page + 1 })}
              disabled={urlState.page >= totalPages - 1}
              className="px-3 py-1 bg-panel border border-border rounded font-mono text-xs disabled:opacity-30 hover:border-accent transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
