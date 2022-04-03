import Vue from 'vue'
import Router from 'vue-router'
import Stake from '@/components/Stake'
import Admin from '@/components/Admin'
import ToastService from 'primevue/toastservice';

Vue.use(ToastService).use(Router)

export default new Router({
  routes: [
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

