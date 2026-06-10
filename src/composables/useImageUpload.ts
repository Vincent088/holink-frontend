import { ref } from 'vue'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref('')

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, WEBP, and GIF images are allowed.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Image must be smaller than ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  async function uploadImage(file: File): Promise<string | null> {
    uploadError.value = ''

    const validationError = validateFile(file)
    if (validationError) {
      uploadError.value = validationError
      return null
    }

    isUploading.value = true

    try {
      const base64 = await fileToBase64(file)
      return base64
    } catch {
      uploadError.value = 'Failed to upload image. Please try again.'
      return null
    } finally {
      isUploading.value = false
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  return {
    isUploading,
    uploadError,
    uploadImage,
  }
}
