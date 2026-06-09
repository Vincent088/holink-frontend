export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'whatsapp' | 'marketplace' | 'website' | 'unknown'

export interface HoLinkItem {
  id: string
  title: string
  url: string
  normalizedUrl: string
  platform: Platform
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface HoLinkUser {
  id: string
  username: string
  displayName: string
  bio: string
  avatarUrl?: string
  links: HoLinkItem[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface AnalyticsEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: string
}
