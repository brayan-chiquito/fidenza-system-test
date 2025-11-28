import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

// Mock de useTheme
vi.mock('@/composables/useTheme', () => ({
  useTheme: vi.fn(),
}))

describe('App', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' },
        },
        {
          path: '/login',
          name: 'login',
          component: { template: '<div>Login</div>' },
        },
      ],
    })

    vi.mocked(useTheme).mockReturnValue({
      loadTheme: vi.fn(),
      theme: { value: 'system' },
      effectiveTheme: { value: 'light' },
      isDark: { value: false },
      isLight: { value: true },
      isSystem: { value: true },
      prefersDark: { value: false },
      setLightTheme: vi.fn(),
      setDarkTheme: vi.fn(),
      setSystemTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })
  })

  it('debe renderizar el RouterView', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    // RouterView es un componente, verificar que el componente App se montó correctamente
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })

  it('debe inicializar autenticación al montar', async () => {
    const authStore = useAuthStore()
    const initializeAuthSpy = vi.spyOn(authStore, 'initializeAuth')

    mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(initializeAuthSpy).toHaveBeenCalled()
  })

  it('debe cargar el tema al montar', async () => {
    const loadThemeMock = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      loadTheme: loadThemeMock,
      theme: { value: 'system' },
      effectiveTheme: { value: 'light' },
      isDark: { value: false },
      isLight: { value: true },
      isSystem: { value: true },
      prefersDark: { value: false },
      setLightTheme: vi.fn(),
      setDarkTheme: vi.fn(),
      setSystemTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })

    mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(loadThemeMock).toHaveBeenCalled()
  })
})
