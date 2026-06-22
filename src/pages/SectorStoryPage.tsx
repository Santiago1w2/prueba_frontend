import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getSectorStory } from '@/api/resources'
import type { SectorStory, StoryStage } from '@/types/api'
import { ApiRequestError } from '@/api/client'

// ── Color tokens → Tailwind classes ─────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string; glow: string }> = {
  emerald:   { bg: 'bg-stable/10',    text: 'text-stable',      bar: 'bg-stable',    glow: '#00E676' },
  cyan:      { bg: 'bg-accent/10',    text: 'text-accent',      bar: 'bg-accent',    glow: '#00E5FF' },
  amber:     { bg: 'bg-warn/10',      text: 'text-warn',        bar: 'bg-warn',      glow: '#FFB800' },
  red:       { bg: 'bg-danger/10',    text: 'text-danger',      bar: 'bg-danger',    glow: '#FF3D5A' },
  purple:    { bg: 'bg-purple-500/10',text: 'text-purple-400',  bar: 'bg-purple-400',glow: '#A855F7' },
  blue:      { bg: 'bg-blue-500/10',  text: 'text-blue-400',    bar: 'bg-blue-400',  glow: '#60A5FA' },
  orange:    { bg: 'bg-orange-500/10',text: 'text-orange-400',  bar: 'bg-orange-400',glow: '#FB923C' },
  indigo:    { bg: 'bg-indigo-500/10',text: 'text-indigo-400',  bar: 'bg-indigo-400',glow: '#818CF8' },
}

function getColor(token: string) {
  return COLOR_MAP[token] ?? COLOR_MAP['cyan']
}

// ── Stage visual ─────────────────────────────────────────────────────────────

function StageVisual({ stage, climate }: { stage: StoryStage; climate: string }) {
  const color = getColor(stage.colorToken)
  const pulseSeed = stage.order

  const climatePatterns: Record<string, React.ReactNode> = {
    PIXEL_FOREST: (
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              width: 8 + (i % 3) * 4,
              height: 8 + (i % 3) * 4,
              left: `${((i * 37 + pulseSeed * 11) % 90) + 5}%`,
              top: `${((i * 23 + pulseSeed * 7) % 80) + 10}%`,
              background: color.glow,
              opacity: 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>
    ),
    NEON_CAVE: (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-lg opacity-10"
            style={{
              width: 60 + i * 20,
              height: 60 + i * 20,
              left: `${(i * 31 + pulseSeed * 13) % 80}%`,
              top: `${(i * 17 + pulseSeed * 9) % 80}%`,
              background: color.glow,
            }}
          />
        ))}
      </div>
    ),
    CLOUD_AQUARIUM: (
      <div className="absolute inset-0 overflow-hidden opacity-15">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: 40 + i * 30,
              height: 40 + i * 30,
              left: `${(i * 19 + pulseSeed * 7) % 75}%`,
              top: `${(i * 13 + pulseSeed * 5) % 75}%`,
              borderColor: color.glow,
            }}
          />
        ))}
      </div>
    ),
    RETRO_ARCADE: (
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(${color.glow} 1px, transparent 1px), linear-gradient(90deg, ${color.glow} 1px, transparent 1px)`,
          backgroundSize: `${20 + pulseSeed * 3}px ${20 + pulseSeed * 3}px`,
        }}
      />
    ),
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${color.bg} border border-white/10 h-full flex flex-col items-center justify-center p-6 transition-all duration-700`}
      style={{ minHeight: 320 }}
    >
      {climatePatterns[climate] ?? null}

      {/* Stage number */}
      <div className="relative z-10 text-center space-y-4">
        <div
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color.bg}`}
          style={{ borderColor: color.glow, boxShadow: `0 0 24px ${color.glow}40` }}
        >
          <span className={`font-mono text-2xl font-bold ${color.text}`}>
            {stage.order + 1}
          </span>
        </div>

        <h3 className={`font-mono text-lg font-bold ${color.text}`}>{stage.title}</h3>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-xs">
          {[
            { label: 'Estabilidad', value: stage.metrics.stability },
            { label: 'Energía', value: stage.metrics.energy },
            { label: 'Alertas', value: stage.metrics.alerts },
          ].map(({ label, value }) => (
            <div key={label} className="bg-void/40 rounded p-2 text-center">
              <div className={`font-mono text-lg font-bold ${color.text}`}>{value}</div>
              <div className="font-mono text-xs text-text-dim mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-2">
          <div className="bg-void/40 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${color.bar} transition-all duration-700`}
              style={{ width: `${(stage.progress ?? 0) * 100}%` }}
            />
          </div>
          <p className="font-mono text-xs text-text-dim mt-1 text-center">
            Progreso del sector: {Math.round((stage.progress ?? 0) * 100)}%
          </p>
        </div>

        <p className={`font-mono text-xs ${color.text} opacity-70`}>
          Evento: {stage.dominantEvent}
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SectorStoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [story, setStory] = useState<SectorStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState(0)

  const stageRefs = useRef<(HTMLElement | null)[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!id) return
    getSectorStory(id)
      .then(setStory)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar historia')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Intersection observer for scroll-driven stage activation
  useEffect(() => {
    if (!story) return

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stageRefs.current.findIndex((el) => el === entry.target)
            if (idx !== -1) setActiveStage(idx)
          }
        })
      },
      { rootMargin: '-30% 0px -40% 0px', threshold: 0 },
    )

    stageRefs.current.forEach((el) => {
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [story])

  const scrollToStage = useCallback((idx: number) => {
    const el = stageRefs.current[idx]
    if (!el) return
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth', block: 'center' })
  }, [prefersReducedMotion])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!story) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next = Math.min(activeStage + 1, story.stages.length - 1)
        scrollToStage(next)
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = Math.max(activeStage - 1, 0)
        scrollToStage(prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [story, activeStage, scrollToStage])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-5 w-32 bg-surface rounded animate-pulse" />
        <div className="h-screen bg-panel border border-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-accent font-mono text-xs hover:underline">
          ← Volver
        </button>
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
          <p className="text-danger font-mono text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!story) return null

  const current = story.stages[activeStage]
  const currentColor = getColor(current?.colorToken ?? 'cyan')
  const totalStages = story.stages.length

  return (
    <div className="relative">
      {/* Back link */}
      <div className="mb-4">
        <Link to="/sectors" className="text-accent font-mono text-xs hover:underline">
          ← Volver a Sectores
        </Link>
      </div>

      {/* Sector header */}
      <div className="mb-8">
        <p className="text-text-dim font-mono text-xs uppercase tracking-widest">{story.sector.climate.replace('_', ' ')}</p>
        <h1 className="font-mono text-2xl font-bold text-text-primary mt-1">{story.sector.name}</h1>
        <p className="text-text-secondary font-mono text-sm mt-1">
          Historia visual · {totalStages} etapas · Usa ↑↓ para navegar
        </p>
      </div>

      <div className="flex gap-8 relative">
        {/* ── Sticky visual panel (desktop) ─────────────────────────────── */}
        <aside
          className="hidden lg:block w-80 shrink-0"
          aria-hidden="true"
        >
          <div className="sticky top-20 space-y-4">
            {/* Stage visual */}
            {current && (
              <StageVisual stage={current} climate={story.sector.climate} />
            )}

            {/* Progress dots */}
            <nav aria-label="Navegación por etapas">
              <div className="flex gap-1.5 justify-center flex-wrap">
                {story.stages.map((stage, i) => (
                  <button
                    key={stage.id}
                    onClick={() => scrollToStage(i)}
                    aria-label={`Ir a etapa ${i + 1}: ${stage.title}`}
                    aria-current={i === activeStage ? 'step' : undefined}
                    className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-void ${
                      i === activeStage
                        ? `${currentColor.bar} scale-125`
                        : 'bg-border hover:bg-muted'
                    }`}
                  />
                ))}
              </div>
            </nav>

            {/* Overall progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-text-dim">Recorrido</span>
                <span className="font-mono text-xs text-text-dim">
                  {activeStage + 1}/{totalStages}
                </span>
              </div>
              <div className="bg-surface rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${currentColor.bar} transition-all duration-500`}
                  style={{
                    width: `${((activeStage) / Math.max(totalStages - 1, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Scrollable narrative ───────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Mobile: current stage visual */}
          <div className="lg:hidden mb-6 sticky top-14 z-30 bg-void/80 backdrop-blur pb-3">
            {current && (
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${currentColor.bg}`}
                  style={{ borderColor: currentColor.glow }}
                >
                  <span className={`font-mono text-xs font-bold ${currentColor.text}`}>
                    {activeStage + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-mono text-sm font-bold truncate ${currentColor.text}`}>
                    {current.title}
                  </p>
                  <div className="bg-surface rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full ${currentColor.bar} transition-all`}
                      style={{ width: `${((activeStage) / Math.max(totalStages - 1, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs text-text-dim shrink-0">
                  {activeStage + 1}/{totalStages}
                </span>
              </div>
            )}
          </div>

          {/* Stage sections */}
          <div className="space-y-[60vh]">
            {story.stages.map((stage, i) => {
              const color = getColor(stage.colorToken)
              const isActive = i === activeStage
              return (
                <section
                  key={stage.id}
                  ref={(el) => { stageRefs.current[i] = el }}
                  tabIndex={0}
                  aria-label={`Etapa ${i + 1}: ${stage.title}`}
                  className={`rounded-xl border p-6 lg:p-8 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-accent ${
                    isActive
                      ? `${color.bg} border-white/20`
                      : 'bg-panel border-border opacity-60'
                  }`}
                  style={
                    isActive && !prefersReducedMotion
                      ? { boxShadow: `0 0 40px ${color.glow}20` }
                      : {}
                  }
                >
                  {/* Mobile visual */}
                  <div className="lg:hidden mb-5">
                    <StageVisual stage={stage} climate={story.sector.climate} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold border rounded px-2 py-0.5 ${color.text}`}
                        style={{ borderColor: color.glow + '60' }}
                      >
                        ETAPA {i + 1}
                      </span>
                      <span className="font-mono text-xs text-text-dim">{stage.dominantEvent}</span>
                    </div>

                    <h2
                      className={`font-mono text-xl font-bold ${isActive ? color.text : 'text-text-secondary'} transition-colors duration-500`}
                    >
                      {stage.title}
                    </h2>

                    <p className="text-text-secondary font-sans text-base leading-relaxed">
                      {stage.narrative}
                    </p>

                    {/* Metrics (mobile/visible in section) */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Estabilidad', value: stage.metrics.stability },
                        { label: 'Energía', value: stage.metrics.energy },
                        { label: 'Alertas', value: stage.metrics.alerts },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-void/40 rounded-lg p-3 text-center">
                          <div className={`font-mono text-xl font-bold ${isActive ? color.text : 'text-text-dim'}`}>
                            {value}
                          </div>
                          <div className="font-mono text-xs text-text-dim mt-0.5">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Asset key indicator */}
                    <p className="font-mono text-xs text-text-dim">
                      Visual: <span className={isActive ? color.text : 'text-text-dim'}>{stage.assetKey}</span>
                    </p>
                  </div>
                </section>
              )
            })}
          </div>

          {/* End of story */}
          <div className="mt-16 mb-8 text-center space-y-4">
            <div className="w-16 h-px bg-border mx-auto" />
            <p className="font-mono text-sm text-text-dim">
              Fin de la historia — {totalStages} etapas completadas
            </p>
            <Link
              to="/sectors"
              className="inline-block border border-border hover:border-accent rounded-lg px-5 py-2 font-mono text-xs text-text-secondary hover:text-accent transition-colors"
            >
              ← Ver todos los sectores
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
