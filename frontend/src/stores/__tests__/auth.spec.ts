import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import * as authApi from '@/api/auth'
import { tokenUtils } from '@/utils/token'
import type { User } from '@/types/auth'

// Mock de las funciones de API
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
}))

// Mock de tokenUtils
vi.mock('@/utils/token', () => ({
  tokenUtils: {
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.fullName).toBe('')
    })
  })

  describe('login', () => {
    it('debe iniciar sesión correctamente', async () => {
      const store = useAuthStore()
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }
      const mockResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        user: mockUser,
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      await store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(store.user).toEqual(mockUser)
      expect(store.accessToken).toBe('access-token')
      expect(store.refreshToken).toBe('refresh-token')
      expect(store.isAuthenticated).toBe(true)
      expect(store.fullName).toBe('Juan Pérez')
      expect(tokenUtils.setAccessToken).toHaveBeenCalledWith('access-token')
      expect(tokenUtils.setRefreshToken).toHaveBeenCalledWith('refresh-token')
      expect(tokenUtils.setUser).toHaveBeenCalledWith(mockUser)
    })

    it('debe manejar errores en login', async () => {
      const store = useAuthStore()
      const error = new Error('Credenciales inválidas')

      vi.mocked(authApi.login).mockRejectedValue(error)

      await expect(
        store.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow()

      expect(store.error).toBe('Credenciales inválidas')
      expect(store.loading).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('debe registrar y autenticar automáticamente', async () => {
      const store = useAuthStore()
      const mockUser: User = {
        id: 1,
        email: 'new@example.com',
        first_name: 'María',
        last_name: 'González',
        is_active: true,
      }

      vi.mocked(authApi.register).mockResolvedValue({
        message: 'Usuario registrado exitosamente',
        user: mockUser,
      })

      vi.mocked(authApi.login).mockResolvedValue({
        access: 'access-token',
        refresh: 'refresh-token',
        user: mockUser,
      })

      await store.register({
        email: 'new@example.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'María',
        last_name: 'González',
      })

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('debe manejar errores en registro', async () => {
      const store = useAuthStore()
      const error = new Error('Email ya registrado')

      vi.mocked(authApi.register).mockRejectedValue(error)

      await expect(
        store.register({
          email: 'existing@example.com',
          password: 'password123',
          password_confirm: 'password123',
          first_name: 'Test',
          last_name: 'User',
        })
      ).rejects.toThrow()

      expect(store.error).toBe('Email ya registrado')
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('debe limpiar todos los datos al hacer logout', () => {
      const store = useAuthStore()
      
      // Establecer estado autenticado
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }
      store.accessToken = 'token'
      store.refreshToken = 'refresh'

      store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.error).toBeNull()
      expect(tokenUtils.clearTokens).toHaveBeenCalled()
    })
  })

  describe('initializeAuth', () => {
    it('debe cargar tokens y usuario desde localStorage', () => {
      const store = useAuthStore()
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('saved-access-token')
      vi.mocked(tokenUtils.getRefreshToken).mockReturnValue('saved-refresh-token')
      vi.mocked(tokenUtils.getUser).mockReturnValue(mockUser)

      store.initializeAuth()

      expect(store.accessToken).toBe('saved-access-token')
      expect(store.refreshToken).toBe('saved-refresh-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('no debe hacer nada si no hay tokens guardados', () => {
      const store = useAuthStore()

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue(null)
      vi.mocked(tokenUtils.getRefreshToken).mockReturnValue(null)
      vi.mocked(tokenUtils.getUser).mockReturnValue(null)

      store.initializeAuth()

      expect(store.accessToken).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('refreshAccessToken', () => {
    it('debe renovar el token correctamente', async () => {
      const store = useAuthStore()
      store.refreshToken = 'old-refresh-token'

      vi.mocked(authApi.refreshToken).mockResolvedValue({
        access: 'new-access-token',
        refresh: 'new-refresh-token',
      })

      await store.refreshAccessToken()

      expect(store.accessToken).toBe('new-access-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(tokenUtils.setAccessToken).toHaveBeenCalledWith('new-access-token')
      expect(tokenUtils.setRefreshToken).toHaveBeenCalledWith('new-refresh-token')
    })

    it('debe hacer logout si falla la renovación', async () => {
      const store = useAuthStore()
      store.refreshToken = 'invalid-refresh-token'

      vi.mocked(authApi.refreshToken).mockRejectedValue(new Error('Token inválido'))

      await expect(store.refreshAccessToken()).rejects.toThrow()

      expect(store.accessToken).toBeNull()
      expect(tokenUtils.clearTokens).toHaveBeenCalled()
    })
  })

  describe('clearError', () => {
    it('debe limpiar el error', () => {
      const store = useAuthStore()
      store.error = 'Error de prueba'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('debe retornar true cuando hay token y usuario', () => {
      const store = useAuthStore()
      store.accessToken = 'token'
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      expect(store.isAuthenticated).toBe(true)
    })

    it('debe retornar false cuando falta token', () => {
      const store = useAuthStore()
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      expect(store.isAuthenticated).toBe(false)
    })

    it('debe retornar false cuando falta usuario', () => {
      const store = useAuthStore()
      store.accessToken = 'token'

      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('fullName', () => {
    it('debe retornar nombre completo', () => {
      const store = useAuthStore()
      store.user = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }

      expect(store.fullName).toBe('Juan Pérez')
    })

    it('debe retornar cadena vacía si no hay usuario', () => {
      const store = useAuthStore()
      expect(store.fullName).toBe('')
    })
  })
})

