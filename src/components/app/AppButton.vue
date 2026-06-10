<template>
  <Button :variant="variant" :size="size" :disabled="disabled || loading" :class="cn($attrs.class)" @click="emit('click')">
    <span v-if="loading" class="btn-spinner" />
    <slot />
  </Button>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button'
  import { cn } from '@/lib/utils'
  import type { ButtonVariants } from '@/components/ui/button'

  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    loading?: boolean
    disabled?: boolean
  }>()

  defineOptions({ inheritAttrs: false })

  const emit = defineEmits<{ click: [] }>()
</script>

<style scoped>
  .btn-spinner {
    @apply w-4 h-4 border-2 border-current border-t-transparent 
           rounded-full animate-spin;
  }
</style>
