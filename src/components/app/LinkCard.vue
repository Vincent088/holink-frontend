<template>
  <div :class="cardClass">
    <!-- View Mode -->
    <template v-if="!isEditing">
      <div class="card-body">
        <!-- Drag handle -->
        <div class="drag-handle" title="Drag to reorder">
          <GripVertical :size="16" />
        </div>

        <!-- Up/Down buttons -->
        <div class="reorder-btns">
          <button class="reorder-btn" :disabled="isFirst" @click="$emit('move-up')">
            <ChevronUp :size="14" />
          </button>
          <button class="reorder-btn" :disabled="isLast" @click="$emit('move-down')">
            <ChevronDown :size="14" />
          </button>
        </div>

        <!-- Link info -->
        <div class="link-info">
          <div class="link-header">
            <span class="link-title">{{ link.title }}</span>
            <PlatformBadge :platform="link.platform" />
          </div>
          <span class="link-url">{{ link.normalizedUrl }}</span>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <Switch :model-value="link.isActive" @update:model-value="$emit('toggle')" />
          <button class="action-btn" @click="$emit('edit')">
            <Pencil :size="15" />
          </button>
          <button class="action-btn action-btn--danger" @click="$emit('delete')">
            <Trash2 :size="15" />
          </button>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else>
      <div class="edit-body">
        <div class="edit-fields">
          <AppInput
            :model-value="editForm.title"
            label="Title"
            placeholder="My Instagram"
            :error="editErrors.title"
            :maxlength="60"
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
          <AppButton size="sm" @click="$emit('save-edit')">Save</AppButton>
          <AppButton variant="ghost" size="sm" @click="$emit('cancel-edit')">Cancel</AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronUp, ChevronDown, Pencil, Trash2, GripVertical } from 'lucide-vue-next'
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
  }>()

  defineEmits<{
    edit: []
    'save-edit': []
    'cancel-edit': []
    delete: []
    toggle: []
    'move-up': []
    'move-down': []
    'update:edit-form': [value: { title: string; url: string }]
  }>()

  const cardClass = computed(() => ({
    'link-card': true,
    'link-card--inactive': !props.link.isActive,
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
    @apply p-1 rounded text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors;
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
    @apply p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
  }
  .action-btn--danger {
    @apply hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20;
  }
  .edit-body {
    @apply p-4 flex flex-col gap-4;
  }
  .edit-fields {
    @apply grid grid-cols-1 gap-3 sm:grid-cols-2;
  }
  .edit-actions {
    @apply flex gap-2;
  }
</style>
