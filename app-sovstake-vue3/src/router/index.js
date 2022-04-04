import { createRouter, createWebHistory } from 'vue-router'
import Stake from '@/components/Stake.vue'
import Admin from '@/components/Admin.vue'
import ToastService from 'primevue/toastservice';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:catchAll(.*)',
      redirect: '/stake'
   },
    {
      path: '/',
      name: 'Stake',
      component: Stake
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin
    },
    {
      path: '/stake',
      name: 'Stake',
      component: Stake
    }
  ]
})

export default router
