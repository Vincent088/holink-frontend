import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { validateUsername, validateDisplayName, validateBio } from '@/utils/validation'
import { isValidUrl } from '@/utils/url'

export function useProfileEditor() {
  const store = useUserStore()

  const form = ref({
    username: store.currentUser?.username ?? '',
    displayName: store.currentUser?.displayName ?? '',
    bio: store.currentUser?.bio ?? '',
    avatarUrl: store.currentUser?.avatarUrl ?? '',
  })

  const errors = ref({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
  })

  const isSaving = ref(false)
  const saveSuccess = ref(false)
  const avatarLoadError = ref(false)

  watch(
    () => store.currentUser,
    (user) => {
      if (user) {
        form.value = {
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl ?? '',
        }
      }
    }
  )

  // Reset image load error when user changes the URL
  watch(
    () => form.value.avatarUrl,
    () => {
      avatarLoadError.value = false
      errors.value.avatarUrl = ''
    }
  )

  // Base64 data URLs come from our own file upload — always safe, skip external validation
  function isDataUrl(url: string): boolean {
    return url.startsWith('data:image/')
  }

  function validate(): boolean {
    errors.value.username = validateUsername(form.value.username)?.message ?? ''
    errors.value.displayName = validateDisplayName(form.value.displayName)?.message ?? ''
    errors.value.bio = validateBio(form.value.bio)?.message ?? ''

    const url = form.value.avatarUrl
    if (url && !isDataUrl(url) && !isValidUrl(url)) {
      errors.value.avatarUrl = 'Please enter a valid URL (e.g. https://example.com/photo.jpg)'
    } else if (url && !isDataUrl(url) && avatarLoadError.value) {
      errors.value.avatarUrl = 'Image could not be loaded. Please check the URL and try again.'
    } else {
      errors.value.avatarUrl = ''
    }

    if (!errors.value.username && store.isUsernameTaken(form.value.username, store.currentUser?.id)) {
      errors.value.username = 'This username is already taken.'
    }

    return !errors.value.username && !errors.value.displayName && !errors.value.bio && !errors.value.avatarUrl
  }

  function checkImageLoads(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => resolve(false), 5000)
      img.onload = () => { clearTimeout(timeout); resolve(true) }
      img.onerror = () => { clearTimeout(timeout); resolve(false) }
      img.src = url
    })
  }

  async function save() {
    if (!validate()) return

    isSaving.value = true
    saveSuccess.value = false

    // If URL is provided and not a data URL, confirm the image actually loads before saving
    if (form.value.avatarUrl && !isDataUrl(form.value.avatarUrl) && isValidUrl(form.value.avatarUrl)) {
      const imageLoads = await checkImageLoads(form.value.avatarUrl)
      if (!imageLoads) {
        avatarLoadError.value = true
        errors.value.avatarUrl = 'Image could not be loaded. Please check the URL and try again.'
        isSaving.value = false
        return
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    store.saveProfile(form.value)

    isSaving.value = false
    saveSuccess.value = true

    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }

  return {
    form,
    errors,
    isSaving,
    saveSuccess,
    save,
    avatarLoadError,
  }
}
