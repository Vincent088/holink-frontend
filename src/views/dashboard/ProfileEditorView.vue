<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Profile</h1>
      <p class="page-subtitle">Manage how you appear on your public page.</p>
    </div>

    <!-- Avatar -->
    <div class="avatar-card">
      <!-- Avatar Preview -->
      <div class="avatar-circle" @click="triggerFileInput">
        <img v-if="form.avatarUrl && !avatarLoadError" :src="form.avatarUrl" alt="Avatar" class="w-full h-full object-cover" @error="avatarLoadError = true" />
        <User v-else :size="28" class="text-gray-400 dark:text-gray-600" />

        <!-- Hover Overlay -->
        <div class="avatar-overlay">
          <Camera :size="16" class="text-white" />
        </div>
      </div>

      <!-- Upload Controls -->
      <div class="avatar-controls">
        <p class="avatar-label">Profile Photo</p>

        <!-- File Upload Button -->
        <div class="upload-row">
          <AppButton variant="secondary" size="sm" :loading="isUploading" @click="triggerFileInput">
            <Upload :size="14" />
            {{ isUploading ? 'Uploading...' : 'Upload Image' }}
          </AppButton>

          <span class="or-divider">or</span>

          <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="onFileChange" />

          <AppButton v-if="isUploadedImage" variant="ghost" size="sm" @click="clearAvatar">
            <X :size="14" />
            Remove
          </AppButton>
        </div>

        <!-- URL Input -->
        <AppInput
          v-model="avatarUrlInput"
          :placeholder="isUploadedImage ? 'Custom image uploaded' : 'https://example.com/photo.jpg'"
          :hint="errors.avatarUrl ? undefined : isUploadedImage ? 'Using uploaded image. Type a URL to replace it.' : 'Paste an image URL'"
          :error="errors.avatarUrl"
        />

        <!-- Upload Error -->
        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="form-section">
      <AppInput v-model="form.username" label="Username" placeholder="myusername" :maxlength="30" :error="errors.username" :hint="`holink.io/p/${form.username || 'username'}`" required />

      <AppInput v-model="form.displayName" label="Display Name" placeholder="Your Name" :maxlength="50" :error="errors.displayName" required />

      <AppTextarea v-model="form.bio" label="Bio" placeholder="Tell the world a little about yourself..." :maxlength="160" :error="errors.bio" :rows="3" />
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <AppButton :loading="isSaving" @click="save"> Save Changes </AppButton>

      <Transition name="fade">
        <div v-if="saveSuccess" class="save-success">
          <CheckCircle :size="16" />
          Saved successfully
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { User, CheckCircle, Upload, Camera, X } from 'lucide-vue-next'
  import AppInput from '@/components/app/AppInput.vue'
  import AppTextarea from '@/components/app/AppTextarea.vue'
  import AppButton from '@/components/app/AppButton.vue'
  import { useProfileEditor } from '@/composables/useProfileEditor'
  import { useImageUpload } from '@/composables/useImageUpload'

  const { form, errors, isSaving, saveSuccess, save, avatarLoadError, avatarUrlInput, isUploadedImage, clearAvatar, setUploadedAvatar } = useProfileEditor()
  const { isUploading, uploadError, uploadImage } = useImageUpload()

  const fileInputRef = ref<HTMLInputElement | null>(null)

  function triggerFileInput() {
    fileInputRef.value?.click()
  }

  async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const url = await uploadImage(file)
    if (url) {
      setUploadedAvatar(url)
    }

    if (fileInputRef.value) fileInputRef.value.value = ''
  }
</script>

<style scoped>
  .page {
    @apply max-w-xl mx-auto;
  }
  .page-header {
    @apply mb-8;
  }
  .page-title {
    @apply text-2xl font-bold text-gray-900 dark:text-white;
  }
  .page-subtitle {
    @apply text-sm mt-1 text-gray-500 dark:text-gray-400;
  }
  .avatar-card {
    @apply flex items-center gap-5 mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800;
  }
  .avatar-circle {
    @apply w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 relative cursor-pointer;
  }
  .avatar-overlay {
    @apply absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full;
  }
  .avatar-controls {
    @apply flex-1 min-w-0 space-y-2;
  }
  .avatar-label {
    @apply text-sm font-medium text-gray-900 dark:text-white;
  }
  .upload-row {
    @apply flex items-center gap-2;
  }
  .or-divider {
    @apply text-gray-500 text-xs;
  }
  .upload-error {
    @apply text-xs text-red-500 dark:text-red-400;
  }
  .form-section {
    @apply space-y-5;
  }
  .form-actions {
    @apply mt-8 flex items-center gap-4;
  }
  .save-success {
    @apply flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400;
  }
</style>
