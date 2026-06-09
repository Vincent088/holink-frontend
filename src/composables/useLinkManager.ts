import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { validateLinkTitle, validateLinkUrl } from '@/utils/validation'
import { normalizeUrl, detectPlatform, isValidUrl } from '@/utils/url'
import type { HoLinkItem } from '@/types'

export function useLinkManager() {
  const store = useUserStore()

  const searchQuery = ref('')

  const filteredLinks = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return store.sortedLinks
    return store.sortedLinks.filter((link) => link.title.toLowerCase().includes(q) || link.url.toLowerCase().includes(q) || link.platform.toLowerCase().includes(q))
  })

  const isAdding = ref(false)
  const addForm = ref({ title: '', url: '' })
  const addErrors = ref({ title: '', url: '' })

  const detectedPlatform = computed(() => (addForm.value.url ? detectPlatform(normalizeUrl(addForm.value.url)) : 'unknown'))

  function openAddForm() {
    addForm.value = { title: '', url: '' }
    addErrors.value = { title: '', url: '' }
    isAdding.value = true
  }

  function closeAddForm() {
    isAdding.value = false
  }

  function validateAddForm(): boolean {
    addErrors.value.title = validateLinkTitle(addForm.value.title)?.message ?? ''
    addErrors.value.url = validateLinkUrl(normalizeUrl(addForm.value.url))?.message ?? ''
    return !addErrors.value.title && !addErrors.value.url
  }

  function addLink() {
    if (!validateAddForm()) return
    store.addLink(addForm.value.title.trim(), addForm.value.url)
    closeAddForm()
  }

  const editingId = ref<string | null>(null)
  const editForm = ref({ title: '', url: '' })
  const editErrors = ref({ title: '', url: '' })

  function openEdit(id: string) {
    const link = store.sortedLinks.find((l) => l.id === id)
    if (!link) return
    editForm.value = { title: link.title, url: link.normalizedUrl }
    editErrors.value = { title: '', url: '' }
    editingId.value = id
  }

  function closeEdit() {
    editingId.value = null
  }

  function validateEditForm(): boolean {
    editErrors.value.title = validateLinkTitle(editForm.value.title)?.message ?? ''
    editErrors.value.url = validateLinkUrl(normalizeUrl(editForm.value.url))?.message ?? ''
    return !editErrors.value.title && !editErrors.value.url
  }

  function saveEdit() {
    if (!editingId.value || !validateEditForm()) return
    store.updateLink(editingId.value, {
      title: editForm.value.title.trim(),
      url: editForm.value.url,
    })
    closeEdit()
  }

  const pendingDeleteId = ref<string | null>(null)
  const pendingDeleteTitle = ref('')
  const deletedLink = ref<HoLinkItem | null>(null)
  let undoTimer: ReturnType<typeof setTimeout> | null = null

  function confirmDelete(id: string) {
    const link = store.sortedLinks.find((l) => l.id === id)
    if (!link) return
    pendingDeleteId.value = id
    pendingDeleteTitle.value = link.title
  }

  function cancelDelete() {
    pendingDeleteId.value = null
    pendingDeleteTitle.value = ''
  }

  function deleteLink() {
    const id = pendingDeleteId.value
    if (!id) return
    const link = store.sortedLinks.find((l) => l.id === id)
    if (!link) return
    if (undoTimer) clearTimeout(undoTimer)
    deletedLink.value = { ...link }
    store.deleteLink(id)
    pendingDeleteId.value = null
    pendingDeleteTitle.value = ''
    undoTimer = setTimeout(() => {
      deletedLink.value = null
    }, 5000)
  }

  function undoDelete() {
    if (!deletedLink.value) return
    if (undoTimer) clearTimeout(undoTimer)
    store.addLink(deletedLink.value.title, deletedLink.value.url)
    deletedLink.value = null
  }

  function toggleLink(id: string) {
    store.toggleLink(id)
  }

  function onReorder(links: HoLinkItem[]) {
    store.reorderLinks(links)
  }

  function moveUp(id: string) {
    const links = [...store.sortedLinks]
    const index = links.findIndex((l) => l.id === id)
    if (index <= 0) return
    ;[links[index - 1], links[index]] = [links[index], links[index - 1]]
    store.reorderLinks(links)
  }

  function moveDown(id: string) {
    const links = [...store.sortedLinks]
    const index = links.findIndex((l) => l.id === id)
    if (index === -1 || index >= links.length - 1) return
    ;[links[index], links[index + 1]] = [links[index + 1], links[index]]
    store.reorderLinks(links)
  }

  const utmLinkId = ref<string | null>(null)

  const utmLink = computed(() => (utmLinkId.value ? (store.sortedLinks.find((l) => l.id === utmLinkId.value) ?? null) : null))

  function openUtm(id: string) {
    utmLinkId.value = id
  }

  function closeUtm() {
    utmLinkId.value = null
  }

  function saveUtm(source: string, medium: string, campaign: string) {
    if (!utmLinkId.value) return
    store.updateLink(utmLinkId.value, {
      utmSource: source.trim() || undefined,
      utmMedium: medium.trim() || undefined,
      utmCampaign: campaign.trim() || undefined,
    })
    closeUtm()
  }

  const isImporting = ref(false)
  const importText = ref('')
  const importError = ref('')

  function openImport() {
    importText.value = ''
    importError.value = ''
    isImporting.value = true
  }

  function closeImport() {
    isImporting.value = false
  }

  function importUrls() {
    const lines = importText.value
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && isValidUrl(normalizeUrl(l)))

    if (lines.length === 0) {
      importError.value = 'No valid URLs found. Make sure each URL is on its own line.'
      return
    }

    lines.forEach((rawUrl) => {
      store.addLink(rawUrl, rawUrl)
    })

    closeImport()
  }

  return {
    searchQuery,
    filteredLinks,
    isAdding,
    addForm,
    addErrors,
    detectedPlatform,
    openAddForm,
    closeAddForm,
    addLink,
    editingId,
    editForm,
    editErrors,
    openEdit,
    closeEdit,
    saveEdit,
    pendingDeleteId,
    pendingDeleteTitle,
    confirmDelete,
    cancelDelete,
    deleteLink,
    deletedLink,
    undoDelete,
    toggleLink,
    moveUp,
    moveDown,
    onReorder,
    utmLinkId,
    utmLink,
    openUtm,
    closeUtm,
    saveUtm,
    isImporting,
    importText,
    importError,
    openImport,
    closeImport,
    importUrls,
  }
}
