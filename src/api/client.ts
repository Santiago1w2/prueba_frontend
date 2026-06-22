import type { ApiError } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR'
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as ApiError
      code = body.error
      message = body.message
    } catch {
      // ignore parse error
    }
    throw new ApiRequestError(res.status, code, message)
  }

  return res.json() as Promise<T>
}

export function getToken(): string | null {
  return localStorage.getItem('tc_token')
}

export function setToken(token: string): void {
  localStorage.setItem('tc_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('tc_token')
}

export function authedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  if (!token) throw new ApiRequestError(401, 'UNAUTHORIZED', 'No token')
  return request<T>(path, options, token)
}

export { request }
