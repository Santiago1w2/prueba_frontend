import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSignalFeed } from '@/api/resources'
import type { Signal, SignalType, Severity, SignalStatus } from '@/types/api'
import { ApiRequestError } from '@/api/client'
import { useUrlState } from '@/hooks/useUrlState'

const SEVERITY_COLORS: Record<Severity, string> = {
  LEVE: 'text-stable border-stable/40',
  MODERADO: 'text-accent border-accent/40',
  GRAVE: 'text-warn border-warn/40',
  CRITICO: 'text-danger border-danger/40',
}

const STATUS_COLORS: Record<SignalStatus, string> = {
  RECIBIDA: 'text-text-secondary',
  PROCESANDO: 'text-warn',
  ATENDIDA: 'text-stable',
}

const SIGNAL_TYPES: SignalType[] = [
  'HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA',
]
const SEVERITIES: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO']
const STATUSES: SignalStatus[] = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA']

const DEFAULTS = {
  signalType: '' as string,
  severity: '' as string,
  status: '' as string,
  q: '' as string,
}

export default function SignalsPage() {
  const [urlFilters, setUrlFilters] = useUrlState(DEFAULTS)
  const location = useLocation()

  const [items, setItems] = useState<Signal[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalEstimate, setTotalEstimate] = useState<number | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [qInput, setQInput] = useState(urlFilters.q)

  const inFlightRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  // Restore scroll position when returning from detail
  const savedScrollRef = useRef<number>(
    (location.state as { scrollY?: number })?.scrollY ?? 0,
  )

  const loadPage = useCallback(
    async (cursor: string | null, isReset: boolean) => {
      if (inFlightRef.current && !isReset) return

      // Cancel previous request on reset
      if (isReset && abortRef.current) {
        abortRef.current.abort()
      }
      const ctrl = new AbortController()
      abortRef.current = ctrl
      inFlightRef.current = true

      if (isReset) {
        setLoadingInitial(true)
        setPageError(null)
      } else {
        setLoadingMore(true)
      }

      try {
        const result = await getSignalFeed(
          {
            signalType: (urlFilters.signalType as SignalType) || undefined,
            severity: (urlFilters.severity as Severity) || undefined,
            status: (urlFilters.status as SignalStatus) || undefined,
            q: urlFilters.q || undefined,
          },
          cursor ?? undefined,
        )

        if (ctrl.signal.aborted) return

        setItems((prev) => {
          if (isReset) {
            seenIds.current = new Set(result.items.map((i) => i.id))
            return result.items
          }
          const fresh = result.items.filter((i) => {
            if (seenIds.current.has(i.id)) return false
            seenIds.current.add(i.id)
            return true
          })
          return [...prev, ...fresh]
        })
        setNextCursor(result.nextCursor)
        setHasMore(result.hasMore)
        setTotalEstimate(result.totalEstimate)
        setPageError(null)
      } catch (err) {
        if (ctrl.signal.aborted) return
        const msg = err instanceof ApiRequestError ? err.message : 'Error al cargar señales'
        setPageError(msg)
      } finally {
        if (!ctrl.signal.aborted) {
          inFlightRef.current = false
          setLoadingInitial(false)
          setLoadingMore(false)
        }
      }
    },
    [urlFilters.signalType, urlFilters.severity, urlFilters.status, urlFilters.q],
  )

  // Reset on filter change
  useEffect(() => {
    setItems([])
    seenIds.current = new Set()
    setNextCursor(null)
    setHasMore(true)
    loadPage(null, true)
  }, [loadPage])

  // Restore scroll after initial load
  useEffect(() => {
    if (!loadingInitial && savedScrollRef.current > 0) {
      window.scrollTo(0, savedScrollRef.current)
      savedScrollRef.current = 0
    }
  }, [loadingInitial])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingInitial && !inFlightRef.current) {
          loadPage(nextCursor, false)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadingInitial, nextCursor, loadPage])

  function handleFilterChange(key: keyof typeof DEFAULTS, value: string) {
    setUrlFilters({ [key]: value })
  }

  function handleSearch() {
    setUrlFilters({ q: qInput })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-xl font-bold text-text-primary">Feed de Señales</h1>
        <p className="text-text-dim font-mono text-xs mt-0.5">
          {totalEstimate !== null ? `~${totalEstimate} señales en total` : '—'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar señales..."
            className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleSearch}
            className="bg-accent text-void font-mono text-xs font-bold px-4 py-1.5 rounded hover:opacity-90"
          >
            BUSCAR
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={urlFilters.signalType}
            onChange={(e) => handleFilterChange('signalType', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Todos los tipos</option>
            {SIGNAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={urlFilters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Toda severidad</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={urlFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-surface border border-border rounded px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Initial loading */}
      {loadingInitial && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-panel border border-border rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loadingInitial && items.length === 0 && !pageError && (
        <div className="bg-panel border border-border rounded-lg p-12 text-center">
          <p className="text-text-dim font-mono text-sm">No hay señales con estos filtros.</p>
        </div>
      )}

      {/* Signal list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((signal) => (
            <Link
              key={signal.id}
              to={`/signals/${signal.id}`}
              state={{ scrollY: window.scrollY }}
              className="block bg-panel border border-border rounded-lg p-4 hover:border-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-xs border rounded px-1.5 py-0.5 ${SEVERITY_COLORS[signal.severity]}`}>
                      {signal.severity}
                    </span>
                    <span className="font-mono text-xs text-text-secondary">{signal.signalType}</span>
                    <span className="font-mono text-xs text-text-dim">·</span>
                    <span className="font-mono text-xs text-text-dim">{signal.tropel.name}</span>
                    <span className="font-mono text-xs text-text-dim hidden sm:inline">({signal.tropel.species})</span>
                  </div>
                  <p className="text-text-secondary font-mono text-xs mt-1.5 truncate">
                    {signal.rawContent}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`font-mono text-xs font-bold ${STATUS_COLORS[signal.status]}`}>
                    {signal.status}
                  </span>
                  <span className="font-mono text-xs text-text-dim">
                    {new Date(signal.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <span className="font-mono text-xs text-accent animate-pulse">Cargando más señales...</span>
        </div>
      )}

      {/* Page error (don't wipe list) */}
      {pageError && !loadingInitial && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex justify-between items-center">
          <p className="text-danger font-mono text-xs">{pageError}</p>
          <button
            onClick={() => loadPage(nextCursor, false)}
            className="text-text-secondary font-mono text-xs underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && items.length > 0 && !loadingMore && (
        <p className="text-center text-text-dim font-mono text-xs py-4">
          — Fin del feed ({items.length} señales) —
        </p>
      )}
    </div>
  )
}
