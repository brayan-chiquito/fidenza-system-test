import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTheme } from '../useTheme'

// Mock de window.matchMedia
const mockMatchMedia = vi.fn((query: string) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList
})

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.clearAllMocks()
  })

  it('debe inicializar con tema system por defecto', () => {
    const theme = useTheme()

    expect(theme.theme.value).toBe('system')
  })

  it('debe cambiar a tema light', () => {
    const theme = useTheme()

    theme.setLightTheme()

    expect(theme.theme.value).toBe('light')
    expect(theme.isDark.value).toBe(false)
    expect(theme.isLight.value).toBe(true)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('debe cambiar a tema dark', () => {
    const theme = useTheme()

    theme.setDarkTheme()

    expect(theme.theme.value).toBe('dark')
    expect(theme.isDark.value).toBe(true)
    expect(theme.isLight.value).toBe(false)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('debe cambiar a tema system', () => {
    const theme = useTheme()

    theme.setSystemTheme()

    expect(theme.theme.value).toBe('system')
    expect(theme.isSystem.value).toBe(true)
    expect(localStorage.getItem('theme')).toBe('system')
  })

  it('debe hacer toggle entre light y dark', () => {
    const theme = useTheme()

    theme.setLightTheme()
    theme.toggleTheme()

    expect(theme.isDark.value).toBe(true)

    theme.toggleTheme()

    expect(theme.isLight.value).toBe(true)
  })

  it('debe cargar el tema guardado desde localStorage', () => {
    localStorage.setItem('theme', 'dark')

    const theme = useTheme()
    theme.loadTheme()

    expect(theme.theme.value).toBe('dark')
    expect(theme.isDark.value).toBe(true)
  })

  it('debe usar sistema si no hay tema guardado', () => {
    const theme = useTheme()
    theme.loadTheme()

    expect(theme.theme.value).toBe('system')
  })

  it('debe actualizar la clase dark en el HTML', () => {
    const theme = useTheme()

    theme.setDarkTheme()

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    theme.setLightTheme()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('debe calcular el tema efectivo correctamente', () => {
    const theme = useTheme()

    theme.setDarkTheme()
    expect(theme.effectiveTheme.value).toBe('dark')

    theme.setLightTheme()
    expect(theme.effectiveTheme.value).toBe('light')
  })
})
