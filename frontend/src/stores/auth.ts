import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, refreshToken as apiRefreshToken } from '@/api/auth'
import { tokenUtils } from '@/utils/token'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

/**
 * Store de autenticación
 * Maneja el estado del usuario autenticado y los tokens JWT
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user: Ref<User | null> = ref(null)
  const accessToken: Ref<string | null> = ref(null)
  const refreshToken: Ref<string | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name} ${user.value.last_name}`.trim()
  })

  // Acciones
  /**
   * Inicia sesión con email y contraseña
   */
  async function login(credentials: LoginRequest): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const response: AuthResponse = await apiLogin(credentials)

      // Guardar tokens
      accessToken.value = response.access
      refreshToken.value = response.refresh
      tokenUtils.setAccessToken(response.access)
      tokenUtils.setRefreshToken(response.refresh)

      // Guardar usuario
      user.value = response.user
      tokenUtils.setUser(response.user)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra un nuevo usuario y lo autentica automáticamente
   */
  async function register(userData: RegisterRequest): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // Registrar usuario
      await apiRegister(userData)

      // Iniciar sesión automáticamente después del registro
      await login({
        email: userData.email,
        password: userData.password,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Renueva el access token usando el refresh token
   */
  async function refreshAccessToken(): Promise<void> {
    try {
      const currentRefreshToken = refreshToken.value || tokenUtils.getRefreshToken()

      if (!currentRefreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const response = await apiRefreshToken(currentRefreshToken)

      // Actualizar tokens
      accessToken.value = response.access
      refreshToken.value = response.refresh
      tokenUtils.setAccessToken(response.access)
      tokenUtils.setRefreshToken(response.refresh)
    } catch (err: unknown) {
      // Si falla la renovación, hacer logout
      logout()
      throw err
    }
  }

  /**
   * Cierra sesión y limpia todos los datos
   */
  function logout(): void {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    error.value = null
    tokenUtils.clearTokens()
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   * Se debe llamar al iniciar la aplicación
   */
  function initializeAuth(): void {
    const storedAccessToken = tokenUtils.getAccessToken()
    const storedRefreshToken = tokenUtils.getRefreshToken()
    const storedUser = tokenUtils.getUser()

    if (storedAccessToken && storedRefreshToken && storedUser) {
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      user.value = storedUser
    }
  }

  /**
   * Limpia el error
   */
  function clearError(): void {
    error.value = null
  }

  return {
    // Estado
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    // Getters
    isAuthenticated,
    fullName,
    // Acciones
    login,
    register,
    refreshAccessToken,
    logout,
    initializeAuth,
    clearError,
  }
})

