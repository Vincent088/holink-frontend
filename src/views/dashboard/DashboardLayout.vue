<template>
  <div class="min-h-screen bg-gray-950 text-white flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full hidden md:flex">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-gray-800">
        <span class="text-xl font-bold text-violet-400 tracking-tight">HoLink</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-4 py-6 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.to) ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Preview Link -->
      <div class="px-4 py-4 border-t border-gray-800">
        <a
          v-if="currentUser"
          :href="`/p/${currentUser.username}`"
          target="_blank"
          class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <ExternalLink :size="18" />
          View Public Page
        </a>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
      <span class="text-lg font-bold text-violet-400">HoLink</span>
      <div class="flex gap-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="isActive(item.to) ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        >
          <component :is="item.icon" :size="14" />
          {{ item.label }}
        </RouterLink>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 px-4 md:px-8 py-6 md:py-10 mt-16 md:mt-0">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { User, Link, ExternalLink } from 'lucide-vue-next'
  import { useUserStore } from '@/stores/user'
  import { storeToRefs } from 'pinia'

  const route = useRoute()
  const userStore = useUserStore()
  const { currentUser } = storeToRefs(userStore)

  const navItems = [
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/links', label: 'Links', icon: Link },
  ]

  function isActive(path: string): boolean {
    return route.path.startsWith(path)
  }
</script>
