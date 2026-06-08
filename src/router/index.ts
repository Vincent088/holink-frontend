import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: () => import('@/views/dashboard/DashboardLayout.vue'),
      children: [
        {
          path: '',
          redirect: 'profile',
        },
        {
          path: 'profile',
          name: 'DashboardProfile',
          component: () => import('@/views/dashboard/ProfileEditorView.vue'),
        },
        {
          path: 'links',
          name: 'DashboardLinks',
          component: () => import('@/views/dashboard/LinkManagerView.vue'),
        },
      ],
    },
    {
      path: '/p/:username',
      name: 'PublicProfile',
      component: () => import('@/views/public/PublicProfileView.vue'),
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: () => import('@/views/public/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/not-found',
    },
  ],
})

export default router
