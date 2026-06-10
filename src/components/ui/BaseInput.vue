<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-violet-600 dark:text-violet-400 ml-0.5">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      class="w-full px-3.5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div class="flex justify-between items-center">
      <p v-if="error" class="text-xs text-red-500 dark:text-red-400">{{ error }}</p>
      <p v-else-if="hint" class="text-xs text-gray-500 dark:text-gray-500">{{ hint }}</p>
      <p v-if="maxlength" class="text-xs text-gray-400 dark:text-gray-500 ml-auto">{{ modelValue.length }}/{{ maxlength }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      modelValue: string
      id?: string
      label?: string
      type?: string
      placeholder?: string
      maxlength?: number
      error?: string
      hint?: string
      required?: boolean
      disabled?: boolean
    }>(),
    {
      type: 'text',
      id: () => `input-${Math.random().toString(36).substring(2, 7)}`,
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()
</script>
