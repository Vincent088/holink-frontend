import type { HoLinkUser, HoLinkItem, HoLinkDraft } from '@/types'
import { generateId } from '@/utils/id'
import { normalizeUrl, detectPlatform } from '@/utils/url'

const STORAGE_KEY = 'holink_users'
const CURRENT_USER_KEY = 'holink_current_user'

function readUsers(): HoLinkUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeUsers(users: HoLinkUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function getAuthenticatedUser(): { users: HoLinkUser[]; user: HoLinkUser; index: number } {
  const userId = localStorage.getItem(CURRENT_USER_KEY) ?? ''
  const users = readUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) throw new Error('Authenticated user not found')
  return { users, user: users[index], index }
}

export function dispatchMock<T>(method: string, path: string, body: unknown): T {
  const profileRoute = path.match(/^\/profile\/(.+)$/)
  if (method === 'GET' && profileRoute) {
    return handleGetProfile(profileRoute[1]) as T
  }

  if (method === 'PATCH' && path === '/users/me') {
    return handleUpdateProfile(body) as T
  }

  if (method === 'POST' && path === '/users/me/links') {
    return handleCreateLink(body) as T
  }

  if (method === 'PUT' && path === '/users/me/links/reorder') {
    handleReorderLinks(body)
    return undefined as T
  }

  const toggleRoute = path.match(/^\/users\/me\/links\/([^/]+)\/toggle$/)
  if (method === 'PATCH' && toggleRoute) {
    handleToggleLink(toggleRoute[1])
    return undefined as T
  }

  const publishRoute = path.match(/^\/users\/me\/links\/([^/]+)\/publish-draft$/)
  if (method === 'POST' && publishRoute) {
    return handlePublishDraft(publishRoute[1]) as T
  }

  const draftRoute = path.match(/^\/users\/me\/links\/([^/]+)\/draft$/)
  if (draftRoute) {
    if (method === 'PATCH') return handleSaveDraft(draftRoute[1], body) as T
    if (method === 'DELETE') return handleDiscardDraft(draftRoute[1]) as T
  }

  const linkRoute = path.match(/^\/users\/me\/links\/([^/]+)$/)
  if (linkRoute) {
    if (method === 'PATCH') return handleUpdateLink(linkRoute[1], body) as T
    if (method === 'DELETE') {
      handleDeleteLink(linkRoute[1])
      return undefined as T
    }
  }

  throw new Error(`[Mock] No handler registered for ${method} ${path}`)
}

function handleGetProfile(username: string): HoLinkUser | null {
  return readUsers().find((u) => u.username === username) ?? null
}

function handleUpdateProfile(body: unknown): HoLinkUser {
  const data = body as Partial<Pick<HoLinkUser, 'username' | 'displayName' | 'bio' | 'avatarUrl'>>
  const { users, user, index } = getAuthenticatedUser()
  const updated: HoLinkUser = { ...user, ...data }
  users[index] = updated
  writeUsers(users)
  return updated
}

function handleCreateLink(body: unknown): HoLinkItem {
  const data = body as { title: string; url: string }
  const { users, user, index } = getAuthenticatedUser()

  const normalized = normalizeUrl(data.url)
  const platform = detectPlatform(normalized)
  const newLink: HoLinkItem = {
    id: generateId(),
    title: data.title.trim(),
    url: data.url,
    normalizedUrl: normalized,
    platform,
    isActive: true,
    order: user.links.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users[index].links.push(newLink)
  writeUsers(users)
  return newLink
}

function handleUpdateLink(linkId: string, body: unknown): HoLinkItem {
  const data = body as Partial<Pick<HoLinkItem, 'title' | 'url' | 'isActive' | 'utmSource' | 'utmMedium' | 'utmCampaign'>>
  const { users, user, index } = getAuthenticatedUser()
  const linkIndex = user.links.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) throw new Error(`Link not found: ${linkId}`)

  const existing = user.links[linkIndex]
  const normalized = data.url ? normalizeUrl(data.url) : existing.normalizedUrl
  const platform = data.url ? detectPlatform(normalized) : existing.platform

  const updated: HoLinkItem = {
    ...existing,
    ...data,
    normalizedUrl: normalized,
    platform,
    updatedAt: new Date().toISOString(),
  }

  users[index].links[linkIndex] = updated
  writeUsers(users)
  return updated
}

function handleDeleteLink(linkId: string): void {
  const { users, user, index } = getAuthenticatedUser()
  users[index].links = user.links.filter((l) => l.id !== linkId)
  users[index].links.forEach((l, i) => {
    l.order = i
  })
  writeUsers(users)
}

function handleToggleLink(linkId: string): void {
  const { users, user, index } = getAuthenticatedUser()
  const linkIndex = user.links.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) throw new Error(`Link not found: ${linkId}`)
  users[index].links[linkIndex].isActive = !user.links[linkIndex].isActive
  writeUsers(users)
}

function handleReorderLinks(body: unknown): void {
  const { links } = body as { links: HoLinkItem[] }
  const { users, index } = getAuthenticatedUser()
  users[index].links = links.map((l, i) => ({ ...l, order: i }))
  writeUsers(users)
}

function handleSaveDraft(linkId: string, body: unknown): HoLinkItem {
  const draft = body as HoLinkDraft
  const { users, user, index } = getAuthenticatedUser()
  const linkIndex = user.links.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) throw new Error(`Link not found: ${linkId}`)
  users[index].links[linkIndex] = { ...user.links[linkIndex], draft }
  writeUsers(users)
  return users[index].links[linkIndex]
}

function handlePublishDraft(linkId: string): HoLinkItem {
  const { users, user, index } = getAuthenticatedUser()
  const linkIndex = user.links.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) throw new Error(`Link not found: ${linkId}`)

  const link = user.links[linkIndex]
  if (!link.draft) throw new Error(`Link ${linkId} has no draft to publish`)

  const updated: HoLinkItem = {
    ...link,
    title: link.draft.title,
    url: link.draft.url,
    normalizedUrl: link.draft.normalizedUrl,
    platform: link.draft.platform,
    updatedAt: new Date().toISOString(),
    draft: undefined,
  }

  users[index].links[linkIndex] = updated
  writeUsers(users)
  return updated
}

function handleDiscardDraft(linkId: string): HoLinkItem {
  const { users, user, index } = getAuthenticatedUser()
  const linkIndex = user.links.findIndex((l) => l.id === linkId)
  if (linkIndex === -1) throw new Error(`Link not found: ${linkId}`)

  const updated: HoLinkItem = { ...user.links[linkIndex], draft: undefined }
  users[index].links[linkIndex] = updated
  writeUsers(users)
  return updated
}
