<template>
  <div :class="cardClass">
    <template v-if="!isEditing">
      <div class="card-body">
        <div class="drag-handle hidden sm:flex" title="Drag to reorder">
          <GripVertical :size="16" />
        </div>

        <div class="reorder-btns">
          <button class="reorder-btn" :disabled="isFirst" aria-label="Move link up" @click="$emit('move-up')">
            <ChevronUp :size="14" />
          </button>
          <button class="reorder-btn" :disabled="isLast" aria-label="Move link down" @click="$emit('move-down')">
            <ChevronDown :size="14" />
          </button>
        </div>

        <div class="link-info">
          <div class="link-header">
            <span class="link-title">{{ link.title }}</span>
            <PlatformBadge :platform="link.platform" />
          </div>
          <span class="link-url">{{ link.normalizedUrl }}</span>
        </div>

        <div class="card-actions">
          <Switch :model-value="link.isActive" @update:model-value="$emit('toggle')" />
          <button class="action-btn" :class="{ 'action-btn--utm-active': hasUtm }" :aria-label="hasUtm ? 'Edit UTM parameters' : 'Add UTM parameters'" @click="$emit('utm')">
            <Tags :size="15" />
          </button>
          <button class="action-btn" aria-label="Edit link" @click="$emit('edit')">
            <Pencil :size="15" />
          </button>
          <button class="action-btn action-btn--danger" aria-label="Delete link" @click="$emit('delete')">
            <Trash2 :size="15" />
          </button>
        </div>
      </div>

      <div v-if="link.draft" class="draft-section">
        <div class="draft-header">
          <span class="draft-label">Unpublished changes</span>
          <div class="draft-actions">
            <button class="draft-btn draft-btn--discard" :disabled="isDraftLoading" @click="$emit('discard-draft')">
              {{ isDraftLoading ? '…' : 'Discard' }}
            </button>
            <button class="draft-btn draft-btn--publish" :disabled="isDraftLoading" @click="$emit('publish-draft')">
              {{ isDraftLoading ? '…' : 'Publish' }}
            </button>
          </div>
        </div>
        <div class="draft-info">
          <div class="draft-row">
            <span class="draft-field-label">Title</span>
            <span class="draft-value">{{ link.draft.title }}</span>
          </div>
          <div class="draft-row">
            <span class="draft-field-label">URL</span>
            <span class="draft-value draft-value--url">{{ link.draft.normalizedUrl }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="edit-body">
        <div class="edit-fields">
          <AppInput
            :model-value="editForm.title"
            label="Title"
            placeholder="My Instagram"
            :error="editErrors.title"
            :maxlength="80"
            @update:model-value="$emit('update:edit-form', { ...editForm, title: $event })"
          />
          <AppInput
            :model-value="editForm.url"
            label="URL"
            placeholder="https://instagram.com/username"
            :error="editErrors.url"
            @update:model-value="$emit('update:edit-form', { ...editForm, url: $event })"
          />
        </div>
        <div class="edit-actions">
          <AppButton size="sm" :loading="isSavingEdit" @click="$emit('save-edit')">Save</AppButton>
          <AppButton variant="outline" size="sm" :loading="isSavingDraft" @click="$emit('save-draft')">Save as Draft</AppButton>
          <AppButton variant="ghost" size="sm" :disabled="isSavingEdit || isSavingDraft" @click="$emit('cancel-edit')">Cancel</AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronUp, ChevronDown, Pencil, Trash2, GripVertical, Tags } from 'lucide-vue-next'
  import { Switch } from '@/components/ui/switch'
  import PlatformBadge from '@/components/app/PlatformBadge.vue'
  import AppInput from '@/components/app/AppInput.vue'
  import AppButton from '@/components/app/AppButton.vue'
  import type { HoLinkItem } from '@/types'

  const props = defineProps<{
    link: HoLinkItem
    isEditing: boolean
    editForm: { title: string; url: string }
    editErrors: { title: string; url: string }
    isFirst: boolean
    isLast: boolean
    isSavingEdit?: boolean
    isSavingDraft?: boolean
    isDraftLoading?: boolean
  }>()

  defineEmits<{
    edit: []
    'save-edit': []
    'save-draft': []
    'cancel-edit': []
    delete: []
    toggle: []
    'move-up': []
    'move-down': []
    utm: []
    'publish-draft': []
    'discard-draft': []
    'update:edit-form': [value: { title: string; url: string }]
  }>()

  const hasUtm = computed(() => !!(props.link.utmSource || props.link.utmMedium || props.link.utmCampaign))

  const cardClass = computed(() => ({
    'link-card': true,
    'link-card--inactive': !props.link.isActive,
    'link-card--has-draft': !!props.link.draft,
    'link-card--editing': props.isEditing,
  }))
</script>

<style scoped>
  .link-card {
    @apply bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-all;
  }
  .link-card--inactive {
    @apply opacity-60;
  }
  .link-card--has-draft {
    @apply border-amber-300 dark:border-amber-700/60;
  }
  .link-card--editing {
    @apply border-violet-400 dark:border-violet-600 ring-2 ring-violet-200 dark:ring-violet-900;
  }
  .card-body {
    @apply flex items-center gap-3 p-4;
  }
  .drag-handle {
    @apply cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 shrink-0 transition-colors;
  }
  .reorder-btns {
    @apply flex flex-col gap-0.5 shrink-0;
  }
  .reorder-btn {
    @apply p-1 rounded text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors
           outline-none focus-visible:ring-2 focus-visible:ring-violet-500;
  }
  .link-info {
    @apply flex-1 min-w-0 flex flex-col gap-1;
  }
  .link-header {
    @apply flex items-center gap-2 flex-wrap;
  }
  .link-title {
    @apply text-sm font-medium text-gray-900 dark:text-white truncate;
  }
  .link-url {
    @apply text-xs text-gray-500 dark:text-gray-400 truncate;
  }
  .card-actions {
    @apply flex items-center gap-2 shrink-0;
  }
  .action-btn {
    @apply p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
           outline-none focus-visible:ring-2 focus-visible:ring-violet-500;
  }
  .action-btn--danger {
    @apply hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20;
  }
  .action-btn--utm-active {
    @apply text-violet-500 dark:text-violet-400;
  }
  .draft-section {
    @apply border-t border-amber-200 dark:border-amber-800/50
           bg-amber-50 dark:bg-amber-950/30
           rounded-b-xl px-4 py-3 flex flex-col gap-2;
  }
  .draft-header {
    @apply flex items-center justify-between gap-2;
  }
  .draft-label {
    @apply text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide;
  }
  .draft-actions {
    @apply flex items-center gap-2;
  }
  .draft-btn {
    @apply text-xs font-medium px-2.5 py-1 rounded-lg transition-colors
           outline-none focus-visible:ring-2 focus-visible:ring-violet-500;
  }
  .draft-btn--discard {
    @apply text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400
           hover:bg-red-50 dark:hover:bg-red-900/20;
  }
  .draft-btn--publish {
    @apply bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500
           text-white;
  }
  .draft-info {
    @apply flex flex-col gap-1;
  }
  .draft-row {
    @apply flex items-baseline gap-2;
  }
  .draft-field-label {
    @apply text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-500 w-8 shrink-0;
  }
  .draft-value {
    @apply text-xs text-gray-700 dark:text-gray-300 font-medium;
  }
  .draft-value--url {
    @apply text-gray-500 dark:text-gray-400 font-normal truncate;
  }
  .edit-body {
    @apply p-4 flex flex-col gap-4;
  }
  .edit-fields {
    @apply grid grid-cols-1 gap-3 sm:grid-cols-2;
  }
  .edit-actions {
    @apply flex gap-2 flex-wrap;
  }
</style>
