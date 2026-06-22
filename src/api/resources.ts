import type {
  DashboardSummary,
  TropelPage,
  TropelFilters,
  Tropel,
  Signal,
  SignalFeed,
  SignalFilters,
  SectorList,
  Sector,
  SectorStory,
  SignalStatus,
} from '@/types/api'
import { authedRequest } from './client'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function getDashboard(): Promise<DashboardSummary> {
  return authedRequest<DashboardSummary>('/dashboard/summary')
}

// ── Tropels ───────────────────────────────────────────────────────────────────

export function getTropels(filters: TropelFilters): Promise<TropelPage> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('size', String(filters.size))
  params.set('sort', filters.sort)
  if (filters.species) params.set('species', filters.species)
  if (filters.vitalState) params.set('vitalState', filters.vitalState)
  if (filters.sectorId) params.set('sectorId', filters.sectorId)
  if (filters.q) params.set('q', filters.q)
  return authedRequest<TropelPage>(`/tropels?${params.toString()}`)
}

export function getTropel(id: string): Promise<Tropel> {
  return authedRequest<Tropel>(`/tropels/${id}`)
}

// ── Signals ───────────────────────────────────────────────────────────────────

export function getSignalFeed(
  filters: SignalFilters,
  cursor?: string,
  limit = 15,
): Promise<SignalFeed> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (cursor) params.set('cursor', cursor)
  if (filters.signalType) params.set('signalType', filters.signalType)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  return authedRequest<SignalFeed>(`/signals/feed?${params.toString()}`)
}

export function getSignal(id: string): Promise<Signal> {
  return authedRequest<Signal>(`/signals/${id}`)
}

export function updateSignalStatus(
  id: string,
  status: SignalStatus,
): Promise<Signal> {
  return authedRequest<Signal>(`/signals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ── Sectors ───────────────────────────────────────────────────────────────────

export function getSectors(): Promise<SectorList> {
  return authedRequest<SectorList>('/sectors')
}

export function getSector(id: string): Promise<Sector> {
  return authedRequest<Sector>(`/sectors/${id}`)
}

export function getSectorStory(id: string): Promise<SectorStory> {
  return authedRequest<SectorStory>(`/sectors/${id}/story`)
}
