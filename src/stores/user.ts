import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HoLinkUser, HoLinkItem } from '@/types'
import { generateId } from '@/utils/id'
import { normalizeUrl, detectPlatform } from '@/utils/url'
import { trackEvent } from '@/utils/analytics'

const STORAGE_KEY = 'holink_users'
const CURRENT_USER_KEY = 'holink_current_user'

const DEFAULT_USER: HoLinkUser = {
  id: generateId(),
  username: 'myprofile',
  displayName: 'My Profile',
  bio: '',
  avatarUrl: '',
  links: [],
}

export const useUserStore = defineStore('user', () => {
  const users = ref<HoLinkUser[]>(loadUsers())
  const currentUserId = ref<string>(loadCurrentUserId())

  const currentUser = computed<HoLinkUser | null>(() => {
    return users.value.find((u) => u.id === currentUserId.value) ?? null
  })

  const activeLinks = computed<HoLinkItem[]>(() => {
    if (!currentUser.value) return []
    return [...currentUser.value.links].filter((l) => l.isActive).sort((a, b) => a.order - b.order)
  })

  const sortedLinks = computed<HoLinkItem[]>(() => {
    if (!currentUser.value) return []
    return [...currentUser.value.links].sort((a, b) => a.order - b.order)
  })

  function loadUsers(): HoLinkUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    const defaultUser = { ...DEFAULT_USER, id: generateId() }
    return [defaultUser]
  }

  function loadCurrentUserId(): string {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY)
      if (raw) return raw
    } catch {}
    return users.value[0]?.id ?? ''
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value))
    localStorage.setItem(CURRENT_USER_KEY, currentUserId.value)
  }

  function getUserByUsername(username: string): HoLinkUser | null {
    return users.value.find((u) => u.username === username) ?? null
  }

  function isUsernameTaken(username: string, excludeId?: string): boolean {
    return users.value.some((u) => u.username === username && u.id !== excludeId)
  }

  function updateCurrentUser(index: number, updated: HoLinkUser) {
    users.value[index] = updated
    persist()
  }

  function saveProfile(data: Partial<Pick<HoLinkUser, 'username' | 'displayName' | 'bio' | 'avatarUrl'>>) {
    if (!currentUser.value) return

    const index = users.value.findIndex((u) => u.id === currentUserId.value)
    if (index === -1) return

    const changedFields = Object.keys(data).filter((key) => data[key as keyof typeof data] !== currentUser.value![key as keyof HoLinkUser])

    updateCurrentUser(index, { ...users.value[index], ...data })

    trackEvent('profile_saved', {
      username: currentUser.value.username,
      changed_fields: changedFields,
    })
  }

  function addLink(title: string, url: string) {
    if (!currentUser.value) return

    const normalized = normalizeUrl(url)
    const platform = detectPlatform(normalized)
    const index = users.value.findIndex((u) => u.id === currentUserId.value)

    const newLink: HoLinkItem = {
      id: generateId(),
      title: title.trim(),
      url,
      normalizedUrl: normalized,
      platform,
      isActive: true,
      order: currentUser.value.links.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.value[index].links.push(newLink)
    persist()

    trackEvent('link_added', {
      link_id: newLink.id,
      platform: newLink.platform,
      url_domain: new URL(normalized).hostname,
    })
  }

  function updateLink(linkId: string, data: Partial<Pick<HoLinkItem, 'title' | 'url' | 'isActive' | 'utmSource' | 'utmMedium' | 'utmCampaign'>>) {
    if (!currentUser.value) return

    const index = users.value.findIndex((u) => u.id === currentUserId.value)
    const linkIndex = users.value[index].links.findIndex((l) => l.id === linkId)
    if (linkIndex === -1) return

    const existing = users.value[index].links[linkIndex]
    const normalized = data.url ? normalizeUrl(data.url) : existing.normalizedUrl
    const platform = data.url ? detectPlatform(normalized) : existing.platform

    users.value[index].links[linkIndex] = {
      ...existing,
      ...data,
      normalizedUrl: normalized,
      platform,
      updatedAt: new Date().toISOString(),
    }

    persist()
  }

  function deleteLink(linkId: string) {
    if (!currentUser.value) return

    const index = users.value.findIndex((u) => u.id === currentUserId.value)
    users.value[index].links = users.value[index].links.filter((l) => l.id !== linkId)

    users.value[index].links.forEach((l, i) => {
      l.order = i
    })
    persist()
  }

  function toggleLink(linkId: string) {
    if (!currentUser.value) return

    const index = users.value.findIndex((u) => u.id === currentUserId.value)
    const linkIndex = users.value[index].links.findIndex((l) => l.id === linkId)
    if (linkIndex === -1) return

    users.value[index].links[linkIndex].isActive = !users.value[index].links[linkIndex].isActive
    persist()
  }

  function reorderLinks(newOrder: HoLinkItem[]) {
    if (!currentUser.value) return

    const index = users.value.findIndex((u) => u.id === currentUserId.value)
    users.value[index].links = newOrder.map((l, i) => ({ ...l, order: i }))
    persist()
  }

  return {
    users,
    currentUserId,
    currentUser,
    activeLinks,
    sortedLinks,
    saveProfile,
    addLink,
    updateLink,
    deleteLink,
    toggleLink,
    reorderLinks,
    getUserByUsername,
    isUsernameTaken,
  }
})
