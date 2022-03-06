import Vue from 'vue'
import Router from 'vue-router'
import Stake from '@/components/Stake'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Stake',
      component: Stake
    }
  ]
})

