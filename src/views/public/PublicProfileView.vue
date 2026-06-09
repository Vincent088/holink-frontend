<template>
  <div class="page">
    <!-- Skeleton -->
    <template v-if="isLoading">
      <div class="profile-card">
        <div class="skeleton skeleton--avatar" />
        <div class="skeleton-info">
          <div class="skeleton skeleton--name" />
          <div class="skeleton skeleton--bio" />
          <div class="skeleton skeleton--bio skeleton--bio-short" />
        </div>
      </div>
      <div class="link-list">
        <div v-for="i in 3" :key="i" class="skeleton skeleton--link" />
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="profile">
      <!-- Profile header -->
      <div class="profile-card">
        <div class="avatar-wrapper">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.displayName" class="avatar" />
          <div v-else class="avatar-fallback">
            {{ initials }}
          </div>
        </div>
        <div class="profile-info">
          <h1 class="display-name">{{ profile.displayName }}</h1>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
        </div>
      </div>

      <!-- Link list -->
      <div v-if="activeLinks.length > 0" class="link-list">
        <button v-for="link in activeLinks" :key="link.id" class="link-btn" @click="handleLinkClick(link)">
          <PlatformBadge :platform="link.platform" />
          <span class="link-title">{{ link.title }}</span>
          <ExternalLink :size="14" class="link-external" />
        </button>
      </div>

      <p v-else class="no-links">No links added yet.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ExternalLink } from 'lucide-vue-next'
  import { profileApi } from '@/services/api'
  import { trackEvent } from '@/utils/analytics'
  import { buildUtmUrl } from '@/utils/url'
  import PlatformBadge from '@/components/app/PlatformBadge.vue'
  import type { HoLinkUser, HoLinkItem } from '@/types'

  const route = useRoute()
  const router = useRouter()

  const isLoading = ref(true)
  const username = route.params.username as string
  const profile = ref<HoLinkUser | null>(null)

  function setMeta(property: string, content: string) {
    const attr = property.startsWith('twitter:') ? 'name' : 'property'
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, property)
      el.setAttribute('data-og', 'dynamic')
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  function applyOgTags(user: HoLinkUser) {
    const linkCount = user.links.filter((l) => l.isActive).length
    const description = user.bio ? user.bio : `${linkCount} link${linkCount !== 1 ? 's' : ''} by ${user.displayName}`
    const pageUrl = window.location.href

    document.title = `${user.displayName} | HoLink`

    setMeta('og:type', 'profile')
    setMeta('og:title', `${user.displayName} | HoLink`)
    setMeta('og:description', description)
    setMeta('og:url', pageUrl)
    if (user.avatarUrl) setMeta('og:image', user.avatarUrl)

    setMeta('twitter:card', user.avatarUrl ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', `${user.displayName} | HoLink`)
    setMeta('twitter:description', description)
  }

  function removeOgTags() {
    document.querySelectorAll('meta[data-og="dynamic"]').forEach((el) => el.remove())
    document.title = 'HoLink'
  }

  const activeLinks = computed(() => (profile.value ? [...profile.value.links].filter((l) => l.isActive).sort((a, b) => a.order - b.order) : []))

  const initials = computed(() => {
    if (!profile.value) return ''
    return profile.value.displayName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  })

  function handleLinkClick(link: HoLinkItem) {
    trackEvent('link_clicked', {
      link_id: link.id,
      title: link.title,
      platform: link.platform,
      url: link.normalizedUrl,
      profile_username: username,
    })
    const finalUrl = buildUtmUrl(link.normalizedUrl, {
      utmSource: link.utmSource,
      utmMedium: link.utmMedium,
      utmCampaign: link.utmCampaign,
    })
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  }

  onMounted(async () => {
    const result = await profileApi.getByUsername(username)

    if (!result) {
      router.replace({ name: 'NotFound' })
      return
    }

    profile.value = result
    applyOgTags(result)

    trackEvent('public_profile_viewed', {
      username,
      link_count: activeLinks.value.length,
      device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    })

    setTimeout(() => {
      isLoading.value = false
    }, 450)
  })

  onUnmounted(() => {
    removeOgTags()
  })
</script>

<style scoped>
  .page {
    @apply min-h-dvh bg-gray-50 dark:bg-gray-950 flex flex-col items-center px-4 py-12;
  }
  .profile-card {
    @apply flex flex-col items-center gap-4 mb-8 text-center w-full max-w-sm;
  }
  .avatar-wrapper {
    @apply shrink-0;
  }
  .avatar {
    @apply w-20 h-20 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-md;
  }
  .avatar-fallback {
    @apply w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/40
           text-violet-700 dark:text-violet-300 text-2xl font-bold
           flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-md;
  }
  .profile-info {
    @apply flex flex-col gap-1;
  }
  .display-name {
    @apply text-xl font-bold text-gray-900 dark:text-white;
  }
  .bio {
    @apply text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs;
  }
  .link-list {
    @apply flex flex-col gap-3 w-full max-w-sm;
  }
  .link-btn {
    @apply w-full flex items-center gap-3 px-4 py-3.5
           bg-white dark:bg-gray-900
           border border-gray-200 dark:border-gray-800
           rounded-xl text-left
           hover:border-violet-300 dark:hover:border-violet-700
           hover:shadow-sm
           active:scale-[0.98]
           transition-all duration-150
           cursor-pointer
           outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-300;
  }
  .link-title {
    @apply flex-1 text-sm font-medium text-gray-900 dark:text-white truncate;
  }
  .link-external {
    @apply text-gray-400 dark:text-gray-600 shrink-0;
  }
  .no-links {
    @apply text-sm text-gray-400 dark:text-gray-600;
  }
  .skeleton {
    @apply bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse;
  }
  .skeleton--avatar {
    @apply w-20 h-20 rounded-full;
  }
  .skeleton-info {
    @apply flex flex-col items-center gap-2;
  }
  .skeleton--name {
    @apply h-5 w-36;
  }
  .skeleton--bio {
    @apply h-3.5 w-56;
  }
  .skeleton--bio-short {
    @apply w-40;
  }
  .skeleton--link {
    @apply h-14 w-full max-w-sm rounded-xl;
  }
</style>
