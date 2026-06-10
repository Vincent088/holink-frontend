import type { HoLinkUser, HoLinkItem, HoLinkDraft } from '@/types'
import { httpClient } from './httpClient'

export const profileApi = {
  getByUsername(username: string): Promise<HoLinkUser | null> {
    return httpClient.get<HoLinkUser | null>(`/profile/${username}`)
  },

  update(data: Partial<Pick<HoLinkUser, 'username' | 'displayName' | 'bio' | 'avatarUrl'>>): Promise<HoLinkUser> {
    return httpClient.patch<HoLinkUser>('/users/me', data)
  },
}

export const linksApi = {
  create(data: { title: string; url: string }): Promise<HoLinkItem> {
    return httpClient.post<HoLinkItem>('/users/me/links', {
      title: data.title,
      url: data.url,
    })
  },

  update(linkId: string, data: Partial<Pick<HoLinkItem, 'title' | 'url' | 'isActive' | 'utmSource' | 'utmMedium' | 'utmCampaign'>>): Promise<HoLinkItem> {
    return httpClient.patch<HoLinkItem>(`/users/me/links/${linkId}`, data)
  },

  remove(linkId: string): Promise<void> {
    return httpClient.delete(`/users/me/links/${linkId}`)
  },

  toggle(linkId: string): Promise<void> {
    return httpClient.patch(`/users/me/links/${linkId}/toggle`)
  },

  reorder(links: HoLinkItem[]): Promise<void> {
    return httpClient.put('/users/me/links/reorder', { links })
  },

  saveDraft(linkId: string, draft: HoLinkDraft): Promise<HoLinkItem> {
    return httpClient.patch<HoLinkItem>(`/users/me/links/${linkId}/draft`, draft)
  },

  publishDraft(linkId: string): Promise<HoLinkItem> {
    return httpClient.post<HoLinkItem>(`/users/me/links/${linkId}/publish-draft`)
  },

  discardDraft(linkId: string): Promise<HoLinkItem> {
    return httpClient.delete<HoLinkItem>(`/users/me/links/${linkId}/draft`)
  },
}
