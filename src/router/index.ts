import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

let isAuth = false

const checkAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (isAuth) {
    next()
    return
  }

  onAuthStateChanged(getAuth(), (user) => {
    isAuth = true

    if (user) {
      next()
    } else {
      next({ path: '/auth' })
    }
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/PageHome.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/PageAuth.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/interview/:id',
    name: 'Interview',
    component: () => import('@/views/PageInterview.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/PageList.vue'),
    beforeEnter: checkAuth
  },
  {
    path: '/statistic',
    name: 'Statistic',
    component: () => import('@/views/PageStatistic.vue'),
    beforeEnter: checkAuth
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
