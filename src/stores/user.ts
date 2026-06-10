import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HoLinkUser, HoLinkItem } from '@/types'
import { generateId } from '@/utils/id'
import { normalizeUrl, detectPlatform } from '@/utils/url'
import { trackEvent } from '@/utils/analytics'
import { profileApi, linksApi } from '@/services/api'

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

  const currentUser = computed<HoLinkUser | null>(() => users.value.find((u) => u.id === currentUserId.value) ?? null)

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultUser]))
    return [defaultUser]
  }

  function loadCurrentUserId(): string {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY)
      if (raw) return raw
    } catch {}
    const id = users.value[0]?.id ?? ''
    localStorage.setItem(CURRENT_USER_KEY, id)
    return id
  }

  function getUserByUsername(username: string): HoLinkUser | null {
    return users.value.find((u) => u.username === username) ?? null
  }

  function isUsernameTaken(username: string, excludeId?: string): boolean {
    return users.value.some((u) => u.username === username && u.id !== excludeId)
  }

  function syncCurrentUserId() {
    localStorage.setItem(CURRENT_USER_KEY, currentUserId.value)
  }

  function findUserIndex(): number {
    return users.value.findIndex((u) => u.id === currentUserId.value)
  }

  function findLinkIndex(index: number, linkId: string): number {
    return users.value[index].links.findIndex((l) => l.id === linkId)
  }

  async function saveProfile(data: Partial<Pick<HoLinkUser, 'username' | 'displayName' | 'bio' | 'avatarUrl'>>): Promise<void> {
    if (!currentUser.value) return

    const changedFields = Object.keys(data).filter((key) => data[key as keyof typeof data] !== currentUser.value![key as keyof HoLinkUser])

    const updated = await profileApi.update(data)

    const index = findUserIndex()
    users.value[index] = updated
    syncCurrentUserId()

    trackEvent('profile_saved', {
      username: updated.username,
      changed_fields: changedFields,
    })
  }

  async function addLink(title: string, url: string): Promise<void> {
    if (!currentUser.value) return

    const newLink = await linksApi.create({ title, url })

    const index = findUserIndex()
    users.value[index].links.push(newLink)

    trackEvent('link_added', {
      link_id: newLink.id,
      platform: newLink.platform,
      url_domain: new URL(newLink.normalizedUrl).hostname,
    })
  }

  async function updateLink(linkId: string, data: Partial<Pick<HoLinkItem, 'title' | 'url' | 'isActive' | 'utmSource' | 'utmMedium' | 'utmCampaign'>>): Promise<void> {
    if (!currentUser.value) return

    const updated = await linksApi.update(linkId, data)

    const index = findUserIndex()
    const linkIndex = findLinkIndex(index, linkId)
    if (linkIndex !== -1) users.value[index].links[linkIndex] = updated
  }

  async function deleteLink(linkId: string): Promise<void> {
    if (!currentUser.value) return

    await linksApi.remove(linkId)

    const index = findUserIndex()
    users.value[index].links = users.value[index].links.filter((l) => l.id !== linkId)
    users.value[index].links.forEach((l, i) => {
      l.order = i
    })
  }

  async function toggleLink(linkId: string): Promise<void> {
    if (!currentUser.value) return

    const index = findUserIndex()
    const linkIndex = findLinkIndex(index, linkId)
    if (linkIndex === -1) return

    users.value[index].links[linkIndex].isActive = !users.value[index].links[linkIndex].isActive

    try {
      await linksApi.toggle(linkId)
    } catch {
      users.value[index].links[linkIndex].isActive = !users.value[index].links[linkIndex].isActive
    }
  }

  async function reorderLinks(newOrder: HoLinkItem[]): Promise<void> {
    if (!currentUser.value) return

    const index = findUserIndex()

    users.value[index].links = newOrder.map((l, i) => ({ ...l, order: i }))

    await linksApi.reorder(newOrder)
  }

  async function saveLinkDraft(linkId: string, title: string, url: string): Promise<void> {
    if (!currentUser.value) return

    const normalized = normalizeUrl(url)
    const platform = detectPlatform(normalized)
    const draft = { title, url, normalizedUrl: normalized, platform }

    const updated = await linksApi.saveDraft(linkId, draft)

    const index = findUserIndex()
    const linkIndex = findLinkIndex(index, linkId)
    if (linkIndex !== -1) users.value[index].links[linkIndex] = updated
  }

  async function publishLinkDraft(linkId: string): Promise<void> {
    if (!currentUser.value) return

    const updated = await linksApi.publishDraft(linkId)

    const index = findUserIndex()
    const linkIndex = findLinkIndex(index, linkId)
    if (linkIndex !== -1) users.value[index].links[linkIndex] = updated
  }

  async function discardLinkDraft(linkId: string): Promise<void> {
    if (!currentUser.value) return

    const updated = await linksApi.discardDraft(linkId)

    const index = findUserIndex()
    const linkIndex = findLinkIndex(index, linkId)
    if (linkIndex !== -1) users.value[index].links[linkIndex] = updated
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
    saveLinkDraft,
    publishLinkDraft,
    discardLinkDraft,
    getUserByUsername,
    isUsernameTaken,
  }
})
