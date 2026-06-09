<template>
  <div class="page">
    <div class="card">
      <div class="icon-wrapper">
        <SearchX :size="40" class="icon" />
      </div>
      <h1 class="title">Page not found</h1>
      <p class="subtitle">The link you followed doesn't exist or may have been removed.</p>
      <RouterLink to="/dashboard/profile" class="btn">
        <LayoutDashboard :size="15" />
        Go to Dashboard
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SearchX, LayoutDashboard } from 'lucide-vue-next'
</script>

<style scoped>
  .page {
    @apply min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4;
  }
  .card {
    @apply flex flex-col items-center gap-4 text-center max-w-sm;
  }
  .icon-wrapper {
    @apply w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-900
           flex items-center justify-center mb-2;
  }
  .icon {
    @apply text-gray-400 dark:text-gray-600;
  }
  .title {
    @apply text-2xl font-bold text-gray-900 dark:text-white;
  }
  .subtitle {
    @apply text-sm text-gray-500 dark:text-gray-400 leading-relaxed;
  }
  .btn {
    @apply mt-2 inline-flex items-center gap-2 px-4 py-2.5
           bg-violet-600 hover:bg-violet-700
           text-white text-sm font-medium
           rounded-lg transition-colors;
  }
</style>
