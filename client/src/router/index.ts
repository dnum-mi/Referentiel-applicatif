import { createRouter, createWebHistory } from 'vue-router'
import { routeNames } from './route-names'

const GlobalSearch = () => import('@/views/GlobalSearch.vue')

const routes = [
  {
    path: '/recherche-application',
    name: 'recherche-application',
    component: GlobalSearch,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'accueil',
    component: () => import('@/views/AppHome.vue'),
  },
  {
    name: routeNames.SIGNIN,
    path: '/se-connecter',
    component: () => import('@/views/login.vue'),
    meta: {
      skipAuth: true,
    },
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
  {
    name: routeNames.LOGOUT,
    path: '/se-deconnecter',
    component: () => import('@/views/Logout.vue'),
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
