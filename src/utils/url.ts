import type { Platform } from '@/types'

const UNSAFE_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:']

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  const lower = trimmed.toLowerCase()
  if (UNSAFE_PROTOCOLS.some((p) => lower.startsWith(p))) {
    return ''
  }

  return `https://${trimmed}`
}

export function isValidUrl(url: string): boolean {
  if (!url) return false

  const lower = url.toLowerCase()
  if (UNSAFE_PROTOCOLS.some((p) => lower.startsWith(p))) return false

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function detectPlatform(url: string): Platform {
  try {
    const { hostname } = new URL(url)
    const host = hostname.replace('www.', '').toLowerCase()

    if (host.includes('instagram.com')) return 'instagram'
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('tiktok.com')) return 'tiktok'
    if (host.includes('wa.me') || host.includes('whatsapp.com')) return 'whatsapp'
    if (host.includes('tokopedia.com') || host.includes('shopee.co') || host.includes('lazada.com') || host.includes('amazon.com') || host.includes('bukalapak.com')) return 'marketplace'

    return 'website'
  } catch {
    return 'unknown'
  }
}

export interface UtmParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  if (!baseUrl) return baseUrl
  const entries: [string, string][] = []
  if (params.utmSource?.trim()) entries.push(['utm_source', params.utmSource.trim()])
  if (params.utmMedium?.trim()) entries.push(['utm_medium', params.utmMedium.trim()])
  if (params.utmCampaign?.trim()) entries.push(['utm_campaign', params.utmCampaign.trim()])
  if (!entries.length) return baseUrl
  try {
    const url = new URL(baseUrl)
    entries.forEach(([k, v]) => url.searchParams.set(k, v))
    return url.toString()
  } catch {
    return baseUrl
  }
}

export function hasUtmParams(params: UtmParams): boolean {
  return !!(params.utmSource?.trim() || params.utmMedium?.trim() || params.utmCampaign?.trim())
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}
