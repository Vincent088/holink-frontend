<template>
  <div class="field">
    <Label v-if="label" :for="id" class="field-label">
      {{ label }}
      <span v-if="required" class="field-required">*</span>
    </Label>
    <Input :id="id" :type="type" v-model="inputValue" :placeholder="placeholder" :maxlength="maxlength" :disabled="disabled" :class="cn(error && 'border-destructive')" />
    <div class="field-footer">
      <p v-if="error" class="field-error">{{ error }}</p>
      <p v-else-if="hint" class="field-hint">{{ hint }}</p>
      <p v-if="maxlength" class="field-count ml-auto">{{ modelValue.length }}/{{ maxlength }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { cn } from '@/lib/utils'

  const props = withDefaults(
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

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const inputValue = computed({
    get: () => props.modelValue,
    set: (val: string) => emit('update:modelValue', val),
  })
</script>

<style scoped>
  .field {
    @apply flex flex-col gap-1.5;
  }
  .field-label {
    @apply text-sm font-medium;
  }
  .field-required {
    @apply text-violet-600 dark:text-violet-400 ml-0.5;
  }
  .field-footer {
    @apply flex justify-between items-center;
  }
  .field-error {
    @apply text-xs text-destructive;
  }
  .field-hint {
    @apply text-xs text-muted-foreground;
  }
  .field-count {
    @apply text-xs text-muted-foreground;
  }
</style>
