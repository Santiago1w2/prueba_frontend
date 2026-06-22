import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getSignal, updateSignalStatus } from '@/api/resources'
import type { Signal, SignalStatus } from '@/types/api'
import { ApiRequestError } from '@/api/client'

const SEVERITY_COLORS: Record<string, string> = {
  LEVE: 'text-stable',
  MODERADO: 'text-accent',
  GRAVE: 'text-warn',
  CRITICO: 'text-danger',
}

const STATUS_COLORS: Record<string, string> = {
  RECIBIDA: 'text-text-secondary',
  PROCESANDO: 'text-warn',
  ATENDIDA: 'text-stable',
}

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const scrollY = (location.state as { scrollY?: number })?.scrollY ?? 0

  const [signal, setSignal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    if (!id) return
    getSignal(id)
      .then(setSignal)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar señal')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(status: SignalStatus) {
    if (!id) return
    setUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(false)
    try {
      const updated = await updateSignalStatus(id, status)
      setSignal(updated)
      setUpdateSuccess(true)
    } catch (err) {
      setUpdateError(err instanceof ApiRequestError ? err.message : 'Error al actualizar')
    } finally {
      setUpdating(false)
    }
  }

  function handleBack() {
    navigate('/signals', { state: { scrollY } })
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-5 w-28 bg-surface rounded animate-pulse" />
        <div className="bg-panel border border-border rounded-lg p-6 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-5 bg-surface rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-accent font-mono text-xs hover:underline">
          ← Volver al feed
        </button>
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
          <p className="text-danger font-mono text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!signal) return null

  const canUpdate = signal.status !== 'ATENDIDA'

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={handleBack} className="text-accent font-mono text-xs hover:underline">
        ← Volver al feed
      </button>

      <div className="bg-panel border border-border rounded-lg p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-dim font-mono text-xs">{signal.id}</p>
            <h1 className="font-mono text-xl font-bold text-text-primary mt-1">
              {signal.signalType}
            </h1>
          </div>
          <span className={`font-mono text-sm font-bold ${SEVERITY_COLORS[signal.severity]}`}>
            {signal.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Estado', value: signal.status, className: STATUS_COLORS[signal.status] },
            { label: 'Tropel', value: signal.tropel.name },
            { label: 'Especie', value: signal.tropel.species },
            { label: 'Creada', value: new Date(signal.createdAt).toLocaleString('es-PE') },
          ].map(({ label, value, className }) => (
            <div key={label} className="bg-surface rounded p-3">
              <p className="text-text-dim font-mono text-xs uppercase">{label}</p>
              <p className={`font-mono text-sm mt-0.5 font-bold ${className ?? 'text-text-primary'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface rounded p-3">
          <p className="text-text-dim font-mono text-xs uppercase mb-1">Contenido</p>
          <p className="text-text-primary font-mono text-sm leading-relaxed">{signal.rawContent}</p>
        </div>

        {/* Update status */}
        {canUpdate && (
          <div className="border-t border-border pt-4 space-y-3">
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              Actualizar estado
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['PROCESANDO', 'ATENDIDA'] as SignalStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updating || signal.status === s}
                  className={`px-4 py-1.5 rounded font-mono text-xs font-bold transition-all disabled:opacity-40 ${
                    s === 'ATENDIDA'
                      ? 'bg-stable/10 border border-stable/40 text-stable hover:bg-stable/20'
                      : 'bg-warn/10 border border-warn/40 text-warn hover:bg-warn/20'
                  }`}
                >
                  {updating ? 'ACTUALIZANDO...' : s}
                </button>
              ))}
            </div>

            {updateSuccess && (
              <p className="text-stable font-mono text-xs">
                ✓ Estado actualizado correctamente
              </p>
            )}
            {updateError && (
              <div className="flex items-center gap-3">
                <p className="text-danger font-mono text-xs">{updateError}</p>
                <button
                  onClick={() => handleStatusUpdate(signal.status === 'RECIBIDA' ? 'PROCESANDO' : 'ATENDIDA')}
                  className="text-text-secondary font-mono text-xs underline"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        )}

        {signal.status === 'ATENDIDA' && (
          <p className="text-stable font-mono text-xs border-t border-border pt-4">
            ✓ Esta señal ya fue atendida.
          </p>
        )}
      </div>
    </div>
  )
}
