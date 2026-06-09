<template>
  <Dialog :open="!!link" @update:open="onOpenChange">
    <DialogContent class="utm-dialog">
      <DialogHeader>
        <DialogTitle>UTM Builder</DialogTitle>
        <DialogDescription>
          Add tracking parameters to <strong>{{ link?.title }}</strong>
        </DialogDescription>
      </DialogHeader>

      <!-- Base URL -->
      <div class="section">
        <p class="section-label">Base URL</p>
        <p class="base-url">{{ link?.normalizedUrl }}</p>
      </div>

      <!-- Fields -->
      <div class="fields">
        <div class="field">
          <label class="field-label">
            utm_source
            <span class="field-hint">Where traffic comes from (e.g. instagram, google)</span>
          </label>
          <AppInput v-model="form.source" placeholder="instagram" />
        </div>

        <div class="field">
          <label class="field-label">
            utm_medium
            <span class="field-hint">Marketing channel (e.g. social, email, cpc)</span>
          </label>
          <AppInput v-model="form.medium" placeholder="social" />
          <!-- Quick-fill chips -->
          <div class="chips">
            <button v-for="preset in mediumPresets" :key="preset" class="chip" :class="{ 'chip--active': form.medium === preset }" type="button" @click="form.medium = preset">
              {{ preset }}
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">
            utm_campaign
            <span class="field-hint">Campaign name (e.g. spring_sale, product_launch)</span>
          </label>
          <AppInput v-model="form.campaign" placeholder="spring_sale" />
        </div>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-header">
          <p class="section-label">Generated URL</p>
          <button class="copy-btn" :class="{ 'copy-btn--copied': copied }" @click="copyUrl">
            <Check v-if="copied" :size="13" />
            <Copy v-else :size="13" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="preview-url">{{ generatedUrl }}</p>
      </div>

      <DialogFooter class="utm-footer">
        <AppButton variant="ghost" size="sm" class="mr-auto" @click="clearUtm"> Clear UTM </AppButton>
        <AppButton variant="ghost" size="sm" @click="$emit('close')">Cancel</AppButton>
        <AppButton size="sm" @click="save">Save</AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Copy, Check } from 'lucide-vue-next'
  import { buildUtmUrl } from '@/utils/url'
  import AppInput from '@/components/app/AppInput.vue'
  import AppButton from '@/components/app/AppButton.vue'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import type { HoLinkItem } from '@/types'

  const props = defineProps<{
    link: HoLinkItem | null
  }>()

  const emit = defineEmits<{
    close: []
    save: [source: string, medium: string, campaign: string]
  }>()

  const mediumPresets = ['social', 'email', 'cpc', 'organic', 'referral']

  const form = ref({ source: '', medium: '', campaign: '' })
  const copied = ref(false)

  watch(
    () => props.link,
    (link) => {
      if (link) {
        form.value = {
          source: link.utmSource ?? '',
          medium: link.utmMedium ?? '',
          campaign: link.utmCampaign ?? '',
        }
      }
    },
    { immediate: true }
  )

  const generatedUrl = computed(() => {
    if (!props.link) return ''
    return buildUtmUrl(props.link.normalizedUrl, {
      utmSource: form.value.source,
      utmMedium: form.value.medium,
      utmCampaign: form.value.campaign,
    })
  })

  function copyUrl() {
    navigator.clipboard.writeText(generatedUrl.value).then(() => {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    })
  }

  function clearUtm() {
    form.value = { source: '', medium: '', campaign: '' }
  }

  function save() {
    emit('save', form.value.source, form.value.medium, form.value.campaign)
  }

  function onOpenChange(open: boolean) {
    if (!open) emit('close')
  }
</script>

<style scoped>
  .utm-dialog {
    @apply max-w-lg;
  }
  .section {
    @apply flex flex-col gap-1;
  }
  .section-label {
    @apply text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide;
  }
  .base-url {
    @apply text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800
           px-3 py-2 rounded-lg break-all;
  }
  .fields {
    @apply flex flex-col gap-4;
  }
  .field {
    @apply flex flex-col gap-1.5;
  }
  .field-label {
    @apply text-sm font-medium text-gray-700 dark:text-gray-300 flex flex-col gap-0.5;
  }
  .field-hint {
    @apply text-xs font-normal text-gray-400 dark:text-gray-500;
  }
  .chips {
    @apply flex flex-wrap gap-1.5 mt-0.5;
  }
  .chip {
    @apply px-2.5 py-1 text-xs rounded-full border
           border-gray-200 dark:border-gray-700
           text-gray-600 dark:text-gray-400
           hover:border-violet-300 dark:hover:border-violet-600
           hover:text-violet-600 dark:hover:text-violet-400
           transition-colors;
  }
  .chip--active {
    @apply bg-violet-50 dark:bg-violet-900/30
           border-violet-300 dark:border-violet-600
           text-violet-600 dark:text-violet-400;
  }
  .preview-section {
    @apply flex flex-col gap-1.5;
  }
  .preview-header {
    @apply flex items-center justify-between;
  }
  .copy-btn {
    @apply inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg
           border border-gray-200 dark:border-gray-700
           text-gray-600 dark:text-gray-400
           hover:border-violet-300 dark:hover:border-violet-600
           hover:text-violet-600 dark:hover:text-violet-400
           transition-colors;
  }
  .copy-btn--copied {
    @apply border-green-300 dark:border-green-700
           text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20;
  }
  .preview-url {
    @apply text-xs text-gray-600 dark:text-gray-400 font-mono
           bg-gray-50 dark:bg-gray-800 px-3 py-2.5 rounded-lg
           break-all leading-relaxed;
  }
  .utm-footer {
    @apply flex items-center;
  }
</style>
