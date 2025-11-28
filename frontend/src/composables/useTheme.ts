import { ref, computed, onMounted, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme'
const HTML_CLASS = 'dark'

/**
 * Composable para manejo de tema (dark mode)
 * Proporciona toggle, persistencia y detección de preferencia del sistema
 */
export function useTheme() {
  // Estado del tema seleccionado
  const theme = ref<Theme>('system')
  
  // Tema efectivo (light o dark)
  const effectiveTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'system') {
      return prefersDark.value ? 'dark' : 'light'
    }
    return theme.value
  })

  // Verifica si el sistema prefiere dark mode
  const prefersDark = ref(false)

  /**
   * Obtiene la preferencia del sistema
   */
  function getSystemPreference(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Actualiza la clase 'dark' en el elemento HTML
   */
  function updateHtmlClass(isDark: boolean): void {
    if (typeof document === 'undefined') return

    const htmlElement = document.documentElement

    if (isDark) {
      htmlElement.classList.add(HTML_CLASS)
    } else {
      htmlElement.classList.remove(HTML_CLASS)
    }
  }

  /**
   * Aplica el tema
   */
  function applyTheme(newTheme: Theme): void {
    theme.value = newTheme
    
    // Guardar en localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }

    // Aplicar clase al HTML
    updateHtmlClass(effectiveTheme.value === 'dark')
  }

  /**
   * Carga el tema guardado desde localStorage o usa la preferencia del sistema
   */
  function loadTheme(): void {
    if (typeof localStorage === 'undefined') {
      prefersDark.value = getSystemPreference()
      updateHtmlClass(prefersDark.value)
      return
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      theme.value = savedTheme
    } else {
      theme.value = 'system'
    }

    prefersDark.value = getSystemPreference()
    updateHtmlClass(effectiveTheme.value === 'dark')
  }

  /**
   * Cambia el tema a light
   */
  function setLightTheme(): void {
    applyTheme('light')
  }

  /**
   * Cambia el tema a dark
   */
  function setDarkTheme(): void {
    applyTheme('dark')
  }

  /**
   * Cambia el tema a system (sigue preferencia del sistema)
   */
  function setSystemTheme(): void {
    applyTheme('system')
  }

  /**
   * Toggle entre light y dark (no system)
   */
  function toggleTheme(): void {
    if (effectiveTheme.value === 'dark') {
      setLightTheme()
    } else {
      setDarkTheme()
    }
  }

  /**
   * Verifica si el tema actual es dark
   */
  const isDark = computed(() => effectiveTheme.value === 'dark')

  /**
   * Verifica si el tema actual es light
   */
  const isLight = computed(() => effectiveTheme.value === 'light')

  /**
   * Verifica si está usando la preferencia del sistema
   */
  const isSystem = computed(() => theme.value === 'system')

  // Escuchar cambios en la preferencia del sistema
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
      prefersDark.value = e.matches
      if (theme.value === 'system') {
        updateHtmlClass(e.matches)
      }
    }

    // Escuchar cambios
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleSystemThemeChange)
    }
  }

  // Observar cambios en el tema efectivo
  watch(
    effectiveTheme,
    (newTheme) => {
      updateHtmlClass(newTheme === 'dark')
    },
    { immediate: true }
  )

  // Cargar tema al montar
  onMounted(() => {
    loadTheme()
  })

  return {
    // Estado
    theme,
    effectiveTheme,
    // Computed
    isDark,
    isLight,
    isSystem,
    prefersDark,
    // Acciones
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    toggleTheme,
    loadTheme,
  }
}

