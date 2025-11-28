import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/**
 * Guard de navegación: verifica autenticación antes de cada ruta
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Inicializar autenticación desde localStorage si no se ha hecho ya
  // Solo si no hay token cargado en memoria pero sí hay en localStorage
  if (!authStore.accessToken) {
    authStore.initializeAuth()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const isAuthenticated = authStore.isAuthenticated

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Si el usuario está autenticado y trata de acceder a login o register
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/')
    return
  }

  // Continuar con la navegación
  next()
})

export default router
