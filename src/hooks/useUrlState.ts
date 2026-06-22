import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

type Serializable = string | number | boolean | undefined | null

export function useUrlState<T extends Record<string, Serializable>>(
  defaults: T,
): [T, (updates: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = Object.fromEntries(
    Object.entries(defaults).map(([key, def]) => {
      const raw = searchParams.get(key)
      if (raw === null) return [key, def]
      if (typeof def === 'number') return [key, Number(raw)]
      if (typeof def === 'boolean') return [key, raw === 'true']
      return [key, raw]
    }),
  ) as T

  const setState = useCallback(
    (updates: Partial<T>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          Object.entries(updates).forEach(([k, v]) => {
            const def = defaults[k]
            if (v === undefined || v === null || v === def || v === '') {
              next.delete(k)
            } else {
              next.set(k, String(v))
            }
          })
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaults],
  )

  return [state, setState]
}
