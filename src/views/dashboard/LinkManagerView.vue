<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Links</h1>
        <p class="page-subtitle">Manage the links on your public page.</p>
      </div>
      <div class="header-actions">
        <AppButton variant="outline" size="sm" @click="openImport">
          <Upload :size="15" />
          Import
        </AppButton>
        <AppButton size="sm" @click="openAddForm">
          <Plus :size="15" />
          Add Link
        </AppButton>
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrapper">
      <Search :size="15" class="search-icon" />
      <AppInput v-model="searchQuery" placeholder="Search by title, URL or platform..." class="search-input" />
    </div>

    <!-- Add Form -->
    <Transition name="slide-down">
      <div v-if="isAdding" class="add-form-card">
        <p class="add-form-title">New Link</p>
        <div class="add-form-fields">
          <AppInput v-model="addForm.title" label="Title" placeholder="My Instagram" :maxlength="60" :error="addErrors.title" />
          <div class="url-field">
            <AppInput v-model="addForm.url" label="URL" placeholder="https://instagram.com/username" :error="addErrors.url" />
            <PlatformBadge v-if="addForm.url" :platform="detectedPlatform" class="mt-1.5" />
          </div>
        </div>
        <div class="add-form-actions">
          <AppButton size="sm" @click="addLink">Add Link</AppButton>
          <AppButton variant="ghost" size="sm" @click="closeAddForm">Cancel</AppButton>
        </div>
      </div>
    </Transition>

    <!-- Link List -->
    <draggable v-if="localLinks.length > 0" v-model="localLinks" item-key="id" handle=".drag-handle" class="link-list" @end="onReorder(localLinks)">
      <template #item="{ element: link, index }">
        <LinkCard
          :link="link"
          :is-editing="editingId === link.id"
          :edit-form="editForm"
          :edit-errors="editErrors"
          :is-first="index === 0"
          :is-last="index === localLinks.length - 1"
          @edit="openEdit(link.id)"
          @save-edit="saveEdit"
          @cancel-edit="closeEdit"
          @delete="confirmDelete(link.id)"
          @toggle="toggleLink(link.id)"
          @move-up="moveUp(link.id)"
          @move-down="moveDown(link.id)"
          @update:edit-form="editForm = $event"
        />
      </template>
    </draggable>

    <!-- Empty State -->
    <div v-if="localLinks.length === 0" class="empty-state">
      <LinkIcon :size="40" class="empty-icon" />
      <p class="empty-title">
        {{ searchQuery ? 'No links match your search' : 'No links yet' }}
      </p>
      <p class="empty-subtitle">
        {{ searchQuery ? 'Try a different keyword' : 'Add your first link to get started' }}
      </p>
      <AppButton v-if="!searchQuery" size="sm" class="mt-4" @click="openAddForm">
        <Plus :size="15" />
        Add Link
      </AppButton>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="!!pendingDeleteId" @update:open="cancelDelete">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Link</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{{ pendingDeleteTitle }}"</strong>? You can undo this for 5 seconds after deleting.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <AppButton variant="ghost" @click="cancelDelete">Cancel</AppButton>
          <AppButton variant="destructive" @click="deleteLink">Delete</AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Import Dialog -->
    <Dialog :open="isImporting" @update:open="closeImport">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Multiple URLs</DialogTitle>
          <DialogDescription> Paste one URL per line. Each will be added as a separate link. </DialogDescription>
        </DialogHeader>
        <AppTextarea v-model="importText" placeholder="https://instagram.com/username&#10;https://youtube.com/@channel&#10;https://tiktok.com/@user" :rows="6" :error="importError" />
        <DialogFooter>
          <AppButton variant="ghost" @click="closeImport">Cancel</AppButton>
          <AppButton @click="importUrls">Import</AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Undo Toast -->
    <Transition name="toast">
      <div v-if="deletedLink" class="undo-toast">
        <span class="toast-text">
          <Trash2 :size="15" />
          "{{ deletedLink.title }}" deleted
        </span>
        <button class="toast-undo-btn" @click="undoDelete">Undo</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import draggable from 'vuedraggable'
  import { Plus, Upload, Search, Link as LinkIcon, Trash2 } from 'lucide-vue-next'
  import AppInput from '@/components/app/AppInput.vue'
  import AppTextarea from '@/components/app/AppTextarea.vue'
  import AppButton from '@/components/app/AppButton.vue'
  import LinkCard from '@/components/app/LinkCard.vue'
  import PlatformBadge from '@/components/app/PlatformBadge.vue'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import { useLinkManager } from '@/composables/useLinkManager'
  import type { HoLinkItem } from '@/types'

  const {
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
    isImporting,
    importText,
    importError,
    openImport,
    closeImport,
    importUrls,
  } = useLinkManager()

  const localLinks = ref<HoLinkItem[]>([])
  watch(
    filteredLinks,
    (links) => {
      localLinks.value = [...links]
    },
    { immediate: true, deep: true }
  )
</script>

<style scoped>
  .page {
    @apply max-w-2xl mx-auto;
  }
  .page-header {
    @apply flex items-start justify-between gap-4 mb-6;
  }
  .page-title {
    @apply text-2xl font-bold text-gray-900 dark:text-white;
  }
  .page-subtitle {
    @apply text-sm mt-1 text-gray-500 dark:text-gray-400;
  }
  .header-actions {
    @apply flex gap-2 shrink-0;
  }
  .search-wrapper {
    @apply relative mb-6;
  }
  .search-icon {
    @apply absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10;
  }
  .search-input :deep(input) {
    @apply pl-9;
  }
  .add-form-card {
    @apply bg-white dark:bg-gray-900 border border-violet-300 dark:border-violet-700
           ring-2 ring-violet-100 dark:ring-violet-900/40
           rounded-xl p-4 mb-4 flex flex-col gap-3;
  }
  .add-form-title {
    @apply text-sm font-semibold text-gray-900 dark:text-white;
  }
  .add-form-fields {
    @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
  }
  .url-field {
    @apply flex flex-col;
  }
  .add-form-actions {
    @apply flex gap-2;
  }
  .link-list {
    @apply flex flex-col gap-3;
  }
  .empty-state {
    @apply flex flex-col items-center justify-center py-20 text-center;
  }
  .empty-icon {
    @apply text-gray-300 dark:text-gray-700 mb-4;
  }
  .empty-title {
    @apply text-base font-medium text-gray-700 dark:text-gray-300;
  }
  .empty-subtitle {
    @apply text-sm text-gray-400 dark:text-gray-500 mt-1;
  }
  .undo-toast {
    @apply fixed bottom-6 left-1/2 -translate-x-1/2 z-50
           flex items-center gap-4 px-4 py-3 rounded-xl shadow-lg
           bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
           text-sm font-medium min-w-64;
  }
  .toast-text {
    @apply flex items-center gap-2 flex-1;
  }
  .toast-undo-btn {
    @apply text-violet-400 dark:text-violet-600 hover:text-violet-300
           dark:hover:text-violet-700 font-semibold transition-colors shrink-0;
  }
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.2s ease;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
</style>
