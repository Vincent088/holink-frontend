import { isValidUrl } from './url'
import type { ValidationError } from '../types'

export function validateUsername(value: string): ValidationError | null {
  if (!value) return { field: 'username', message: 'Username is required.' }
  if (value.length < 3) return { field: 'username', message: 'Username must be at least 3 characters.' }
  if (value.length > 30) return { field: 'username', message: 'Username must be 30 characters or less.' }
  if (!/^[a-z0-9_-]+$/.test(value)) return { field: 'username', message: 'Username can only contain lowercase letters, numbers, dash, and underscore.' }
  return null
}

export function validateDisplayName(value: string): ValidationError | null {
  if (!value || !value.trim()) return { field: 'displayName', message: 'Display name is required.' }
  if (value.length > 50) return { field: 'displayName', message: 'Display name must be 50 characters or less.' }
  return null
}

export function validateBio(value: string): ValidationError | null {
  if (value.length > 160) return { field: 'bio', message: 'Bio must be 160 characters or less.' }
  return null
}

export function validateLinkTitle(value: string): ValidationError | null {
  if (!value || !value.trim()) return { field: 'title', message: 'Link title is required.' }
  if (value.length > 80) return { field: 'title', message: 'Link title must be 80 characters or less.' }
  return null
}

export function validateLinkUrl(value: string): ValidationError | null {
  if (!value || !value.trim()) return { field: 'url', message: 'URL is required.' }

  const lower = value.toLowerCase()
  const unsafeProtocols = ['javascript:', 'data:', 'file:', 'vbscript:']
  if (unsafeProtocols.some((p) => lower.startsWith(p))) {
    return { field: 'url', message: 'This URL is not allowed.' }
  }

  if (!isValidUrl(value)) return { field: 'url', message: 'Please enter a valid URL.' }
  return null
}
