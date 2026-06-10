import { ref, watch } from 'vue'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'holink_theme'

const theme = ref<Theme>(loadTheme())

function loadTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem(STORAGE_KEY, t)
}

applyTheme(theme.value)

watch(theme, applyTheme)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
