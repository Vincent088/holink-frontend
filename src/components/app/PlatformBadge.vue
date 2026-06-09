<template>
  <span :class="badgeClass">
    <component :is="icon" :size="12" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Instagram, Youtube, Music2, MessageCircle, ShoppingBag, Globe, Link } from 'lucide-vue-next'
  import type { Platform } from '@/types'

  const props = defineProps<{ platform: Platform }>()

  const config: Record<Platform, { label: string; icon: unknown; style: string }> = {
    instagram: { label: 'Instagram', icon: Instagram, style: 'badge--instagram' },
    youtube: { label: 'YouTube', icon: Youtube, style: 'badge--youtube' },
    tiktok: { label: 'TikTok', icon: Music2, style: 'badge--tiktok' },
    whatsapp: { label: 'WhatsApp', icon: MessageCircle, style: 'badge--whatsapp' },
    marketplace: { label: 'Marketplace', icon: ShoppingBag, style: 'badge--marketplace' },
    website: { label: 'Website', icon: Globe, style: 'badge--website' },
    unknown: { label: 'Link', icon: Link, style: 'badge--unknown' },
  }

  const icon = computed(() => config[props.platform].icon)
  const label = computed(() => config[props.platform].label)
  const badgeClass = computed(() => ['badge', config[props.platform].style])
</script>

<style scoped>
  .badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium;
  }
  .badge--instagram {
    @apply bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400;
  }
  .badge--youtube {
    @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
  }
  .badge--tiktok {
    @apply bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400;
  }
  .badge--whatsapp {
    @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
  }
  .badge--marketplace {
    @apply bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400;
  }
  .badge--website {
    @apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400;
  }
  .badge--unknown {
    @apply bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400;
  }
</style>
