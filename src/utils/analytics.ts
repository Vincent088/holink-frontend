import type { AnalyticsEvent } from '../types'

const STORAGE_KEY = 'holink_analytics'

export function trackEvent(event: string, properties: Record<string, unknown>): void {
  const entry: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  }

  console.log('[Analytics]', entry)

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.push(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {}
}
