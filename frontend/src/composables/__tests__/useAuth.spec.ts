import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '../useAuth'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}))

describe('useAuth', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any)
  })

  it('debe retornar computed properties y funciones', () => {
    const auth = useAuth()

    expect(auth.isAuthenticated).toBeDefined()
    expect(auth.currentUser).toBeDefined()
    expect(auth.fullName).toBeDefined()
    expect(auth.userName).toBeDefined()
    expect(auth.hasValidToken).toBeDefined()
    expect(auth.requireAuth).toBeDefined()
    expect(auth.redirectToLoginIfNotAuthenticated).toBeDefined()
    expect(auth.redirectToDashboardIfAuthenticated).toBeDefined()
    expect(auth.store).toBeDefined()
  })

  it('debe acceder al store correctamente', () => {
    const auth = useAuth()
    const store = useAuthStore()

    expect(auth.store).toBe(store)
  })

  describe('isAuthenticated', () => {
    it('debe retornar false cuando no está autenticado', () => {
      const auth = useAuth()

      expect(auth.isAuthenticated.value).toBe(false)
    })

    it('debe retornar true cuando está autenticado', () => {
      const store = useAuthStore()
      store.accessToken = 'token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      const auth = useAuth()

      expect(auth.isAuthenticated.value).toBe(true)
    })
  })

  describe('userName', () => {
    it('debe retornar el nombre del usuario', () => {
      const store = useAuthStore()
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      const auth = useAuth()

      expect(auth.userName.value).toBe('Juan')
    })

    it('debe retornar "Usuario" si no hay usuario', () => {
      const auth = useAuth()

      expect(auth.userName.value).toBe('Usuario')
    })
  })

  describe('hasValidToken', () => {
    it('debe retornar true si hay token', () => {
      const store = useAuthStore()
      store.accessToken = 'token'

      const auth = useAuth()

      expect(auth.hasValidToken()).toBe(true)
    })

    it('debe retornar false si no hay token', () => {
      const auth = useAuth()

      expect(auth.hasValidToken()).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('debe retornar true si está autenticado', () => {
      const store = useAuthStore()
      store.accessToken = 'token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      const auth = useAuth()

      expect(auth.requireAuth()).toBe(true)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('debe redirigir a login si no está autenticado', () => {
      const auth = useAuth()

      expect(auth.requireAuth()).toBe(false)
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('redirectToLoginIfNotAuthenticated', () => {
    it('debe redirigir a login si no está autenticado', () => {
      const auth = useAuth()

      auth.redirectToLoginIfNotAuthenticated()

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('no debe redirigir si está autenticado', () => {
      const store = useAuthStore()
      store.accessToken = 'token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      const auth = useAuth()
      auth.redirectToLoginIfNotAuthenticated()

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('redirectToDashboardIfAuthenticated', () => {
    it('debe redirigir al dashboard si está autenticado', () => {
      const store = useAuthStore()
      store.accessToken = 'token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      const auth = useAuth()
      auth.redirectToDashboardIfAuthenticated()

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('no debe redirigir si no está autenticado', () => {
      const auth = useAuth()
      auth.redirectToDashboardIfAuthenticated()

      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})

