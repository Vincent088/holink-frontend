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
  const isSubmittingAdd = ref(false)
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

  async function addLink() {
    if (!validateAddForm()) return
    isSubmittingAdd.value = true
    try {
      await store.addLink(addForm.value.title.trim(), addForm.value.url)
      closeAddForm()
    } finally {
      isSubmittingAdd.value = false
    }
  }

  const editingId = ref<string | null>(null)
  const isSavingEdit = ref(false)
  const isSavingDraft = ref(false)
  const editForm = ref({ title: '', url: '' })
  const editErrors = ref({ title: '', url: '' })

  function openEdit(id: string) {
    const link = store.sortedLinks.find((l) => l.id === id)
    if (!link) return

    editForm.value = {
      title: link.draft?.title ?? link.title,
      url: link.draft?.url ?? link.normalizedUrl,
    }
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

  async function saveEdit() {
    if (!editingId.value || !validateEditForm()) return
    isSavingEdit.value = true
    try {
      await store.updateLink(editingId.value, {
        title: editForm.value.title.trim(),
        url: editForm.value.url,
      })

      await store.discardLinkDraft(editingId.value)
      closeEdit()
    } finally {
      isSavingEdit.value = false
    }
  }

  async function saveEditAsDraft() {
    if (!editingId.value || !validateEditForm()) return
    isSavingDraft.value = true
    try {
      await store.saveLinkDraft(editingId.value, editForm.value.title.trim(), editForm.value.url)
      closeEdit()
    } finally {
      isSavingDraft.value = false
    }
  }

  const draftActionLinkId = ref<string | null>(null)

  async function publishDraft(id: string) {
    draftActionLinkId.value = id
    try {
      await store.publishLinkDraft(id)
    } finally {
      draftActionLinkId.value = null
    }
  }

  async function discardDraft(id: string) {
    draftActionLinkId.value = id
    try {
      await store.discardLinkDraft(id)
    } finally {
      draftActionLinkId.value = null
    }
  }

  const pendingDeleteId = ref<string | null>(null)
  const pendingDeleteTitle = ref('')
  const isDeletingLink = ref(false)
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

  async function deleteLink() {
    const id = pendingDeleteId.value
    if (!id) return
    const link = store.sortedLinks.find((l) => l.id === id)
    if (!link) return

    isDeletingLink.value = true
    try {
      if (undoTimer) clearTimeout(undoTimer)
      deletedLink.value = { ...link }
      await store.deleteLink(id)
      pendingDeleteId.value = null
      pendingDeleteTitle.value = ''
      undoTimer = setTimeout(() => {
        deletedLink.value = null
      }, 5000)
    } finally {
      isDeletingLink.value = false
    }
  }

  async function undoDelete() {
    if (!deletedLink.value) return
    if (undoTimer) clearTimeout(undoTimer)
    const linkData = deletedLink.value
    deletedLink.value = null
    await store.addLink(linkData.title, linkData.url)
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

  async function saveUtm(source: string, medium: string, campaign: string) {
    if (!utmLinkId.value) return
    await store.updateLink(utmLinkId.value, {
      utmSource: source.trim() || undefined,
      utmMedium: medium.trim() || undefined,
      utmCampaign: campaign.trim() || undefined,
    })
    closeUtm()
  }

  const isImporting = ref(false)
  const isImportingUrls = ref(false)
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

  async function importUrls() {
    const lines = importText.value
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && isValidUrl(normalizeUrl(l)))

    if (lines.length === 0) {
      importError.value = 'No valid URLs found. Make sure each URL is on its own line.'
      return
    }

    isImportingUrls.value = true
    try {
      await Promise.all(lines.map((rawUrl) => store.addLink(rawUrl, rawUrl)))
      closeImport()
    } finally {
      isImportingUrls.value = false
    }
  }

  return {
    searchQuery,
    filteredLinks,
    isAdding,
    isSubmittingAdd,
    addForm,
    addErrors,
    detectedPlatform,
    openAddForm,
    closeAddForm,
    addLink,
    editingId,
    isSavingEdit,
    isSavingDraft,
    editForm,
    editErrors,
    openEdit,
    closeEdit,
    saveEdit,
    saveEditAsDraft,
    draftActionLinkId,
    publishDraft,
    discardDraft,
    pendingDeleteId,
    pendingDeleteTitle,
    isDeletingLink,
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
    isImportingUrls,
    importText,
    importError,
    openImport,
    closeImport,
    importUrls,
  }
}
