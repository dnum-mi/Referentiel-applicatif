import { createRouter, createWebHistory } from 'vue-router'
import { routeNames } from './route-names'


const routes = [
  {
    name: routeNames.SEARCHAPP,
    path: '/recherche-application',
    component: () => import('@/views/GlobalSearch.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'accueil',
    component: () => import('@/views/AppHome.vue'),
  },
  {
    name: routeNames.CREATEAPP,
    path: '/create-application',
    component: () => import('@/views/CreateApplication.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: routeNames.PROFILEAPP,
    path: '/applications/:id',
    component: () => import('@/views/ApplicationProfile.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || ''),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('access_token') !== null

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'se-connecter' })
  }
  else {
    next()
  }
})

export default router
