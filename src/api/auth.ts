import type { LoginResponse, User } from '@/types/api'
import { request, authedRequest } from './client'

export function login(teamCode: string, email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ teamCode, email, password }),
  })
}

export function me(): Promise<User> {
  return authedRequest<User>('/auth/me')
}
