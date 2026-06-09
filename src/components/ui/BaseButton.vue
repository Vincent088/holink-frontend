<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[variantClasses, sizeClasses]"
    @click="emit('click')"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      type?: 'button' | 'submit' | 'reset'
      variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
      size?: 'sm' | 'md' | 'lg'
      loading?: boolean
      disabled?: boolean
    }>(),
    {
      type: 'button',
      variant: 'primary',
      size: 'md',
    }
  )

  const emit = defineEmits<{
    click: []
  }>()

  const variantClasses = computed(
    () =>
      ({
        primary: 'bg-violet-600 hover:bg-violet-500 text-white',
        secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700',
        danger: 'bg-red-600 hover:bg-red-500 text-white',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
      })[props.variant]
  )

  const sizeClasses = computed(
    () =>
      ({
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-base',
      })[props.size]
  )
</script>
