import { dispatchMock } from './mockHandlers'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const MOCK_MODE = import.meta.env.VITE_MOCK_API

const MOCK_DELAY_MS = 350

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getToken(): string | null {
  return localStorage.getItem('holink_token')
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  return headers
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (MOCK_MODE) {
    await wait(MOCK_DELAY_MS)
    return dispatchMock<T>(method, path, body)
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message ?? `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  const json = await response.json()
  return json.data as T
}

export const httpClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}
