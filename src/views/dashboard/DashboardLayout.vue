<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-header">
        <span class="sidebar-logo">HoLink</span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="navItemClass(item.to)">
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Theme Toggle -->
      <div class="sidebar-bottom">
        <button class="sidebar-action-btn" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="18" />
          <Moon v-else :size="18" />
          {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>

      <!-- Preview Link -->
      <div class="sidebar-footer">
        <a v-if="userStore.currentUser" :href="`/p/${userStore.currentUser.username}`" target="_blank" class="sidebar-action-btn">
          <ExternalLink :size="18" />
          View Public Page
        </a>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <div class="mobile-bar">
      <span class="mobile-logo">HoLink</span>
      <div class="mobile-actions">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="mobileNavItemClass(item.to)">
          <component :is="item.icon" :size="14" />
          {{ item.label }}
        </RouterLink>

        <!-- Mobile Theme Toggle -->
        <button class="mobile-theme-btn" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="16" />
          <Moon v-else :size="16" />
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { User, Link, ExternalLink, Sun, Moon } from 'lucide-vue-next'
  import { useUserStore } from '@/stores/user'
  import { useTheme } from '@/composables/useTheme'

  const route = useRoute()
  const userStore = useUserStore()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/links', label: 'Links', icon: Link },
  ]

  function isActive(path: string): boolean {
    return route.path.startsWith(path)
  }

  function navItemClass(path: string) {
    return {
      'nav-item': true,
      'nav-item--active': isActive(path),
      'nav-item--inactive': !isActive(path),
    }
  }

  function mobileNavItemClass(path: string) {
    return {
      'mobile-nav-item': true,
      'mobile-nav-item--active': isActive(path),
      'mobile-nav-item--inactive': !isActive(path),
    }
  }
</script>

<style scoped>
  .layout {
    @apply min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex;
  }

  .sidebar {
    @apply w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full md:flex;
  }
  .sidebar-header {
    @apply px-6 py-5 border-b border-gray-200 dark:border-gray-800;
  }
  .sidebar-logo {
    @apply text-xl font-bold text-violet-600 dark:text-violet-400 tracking-tight;
  }
  .sidebar-nav {
    @apply flex-1 px-4 py-6 space-y-1;
  }
  .sidebar-bottom {
    @apply px-4 pb-2;
  }
  .sidebar-footer {
    @apply px-4 py-4 border-t border-gray-200 dark:border-gray-800;
  }
  .sidebar-action-btn {
    @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors w-full;
  }

  .nav-item {
    @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors;
  }
  .nav-item--active {
    @apply bg-violet-600 text-white;
  }
  .nav-item--inactive {
    @apply text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white;
  }

  .mobile-bar {
    @apply md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between;
  }
  .mobile-logo {
    @apply text-lg font-bold text-violet-600 dark:text-violet-400;
  }
  .mobile-actions {
    @apply flex gap-2 items-center;
  }
  .mobile-theme-btn {
    @apply p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
  }

  .mobile-nav-item {
    @apply flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors;
  }
  .mobile-nav-item--active {
    @apply bg-violet-600 text-white;
  }
  .mobile-nav-item--inactive {
    @apply text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800;
  }

  .main-content {
    @apply flex-1 md:ml-64 px-4 md:px-8 py-6 md:py-10 mt-16 md:mt-0 bg-gray-50 dark:bg-gray-950 min-h-screen;
  }
</style>
