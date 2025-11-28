import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable para autenticación
 * Proporciona helpers y lógica reutilizable relacionada con autenticación
 */
export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  /**
   * Obtiene el usuario actual
   */
  const currentUser = computed(() => authStore.user)

  /**
   * Obtiene el nombre completo del usuario
   */
  const fullName = computed(() => authStore.fullName)

  /**
   * Obtiene el nombre del usuario (first_name)
   */
  const userName = computed(() => authStore.user?.first_name || 'Usuario')

  /**
   * Verifica si el token de acceso es válido
   */
  function hasValidToken(): boolean {
    return !!authStore.accessToken
  }

  /**
   * Requiere autenticación - redirige a login si no está autenticado
   */
  function requireAuth(): boolean {
    if (!isAuthenticated.value) {
      router.push('/login')
      return false
    }
    return true
  }

  /**
   * Redirige a login si el usuario no está autenticado
   */
  function redirectToLoginIfNotAuthenticated(): void {
    if (!isAuthenticated.value) {
      router.push('/login')
    }
  }

  /**
   * Redirige al dashboard si el usuario está autenticado
   */
  function redirectToDashboardIfAuthenticated(): void {
    if (isAuthenticated.value) {
      router.push('/')
    }
  }

  return {
    // Store (acceso directo a todas las acciones del store)
    store: authStore,
    // Computed
    isAuthenticated,
    currentUser,
    fullName,
    userName,
    // Helpers
    hasValidToken,
    requireAuth,
    redirectToLoginIfNotAuthenticated,
    redirectToDashboardIfAuthenticated,
  }
}

