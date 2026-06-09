<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-violet-400 ml-0.5">*</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :disabled="disabled"
      class="w-full px-3.5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      :class="error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <div class="flex justify-between items-center">
      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
      <p v-else-if="hint" class="text-xs text-gray-500">{{ hint }}</p>
      <p v-if="maxlength" class="text-xs text-gray-500 ml-auto">{{ modelValue.length }}/{{ maxlength }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      modelValue: string
      id?: string
      label?: string
      placeholder?: string
      maxlength?: number
      rows?: number
      error?: string
      hint?: string
      required?: boolean
      disabled?: boolean
    }>(),
    {
      rows: 3,
      id: () => `textarea-${Math.random().toString(36).substring(2, 7)}`,
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()
</script>
