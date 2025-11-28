import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { tokenUtils } from '@/utils/token'
import type { ApiError } from '@/types/api'

/**
 * Cliente Axios configurado para la API
 * - Base URL desde variables de entorno
 * - Interceptor para agregar token JWT
 * - Interceptor para renovar token automáticamente
 * - Manejo de errores global
 */

// Obtener base URL de la API desde variables de entorno
const getApiBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  const finalUrl = envUrl || 'http://localhost:8000'
  
  // Log siempre para debug (también en producción)
  console.log('🔧 API Base URL configurada:', finalUrl)
  
  // Validar que la URL esté configurada en producción
  if (import.meta.env.PROD && !envUrl) {
    console.error('❌ VITE_API_BASE_URL no está configurada en producción!')
    console.error('❌ Usando valor por defecto (localhost) que NO funcionará en producción!')
  }
  
  // Validar formato de URL
  if (envUrl) {
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
      console.error('❌ VITE_API_BASE_URL debe incluir el protocolo (http:// o https://)')
    }
    if (envUrl.endsWith('/')) {
      console.warn('⚠️ VITE_API_BASE_URL no debería terminar en "/" (se añadirá automáticamente)')
    }
  }
  
  return finalUrl
}

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
})

// Flag para evitar loops infinitos al renovar token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor de solicitudes: agrega token JWT si existe
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenUtils.getAccessToken()
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuestas: maneja errores y renueva tokens
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    // Log detallado de errores para debug (siempre)
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL || apiClient.defaults.baseURL,
      fullURL: error.config ? `${error.config.baseURL || apiClient.defaults.baseURL}${error.config.url}` : 'unknown',
      code: error.code,
      apiBaseURLEnv: import.meta.env.VITE_API_BASE_URL || 'NO CONFIGURADA',
    }
    
    // Loggear errores importantes siempre
    if (!error.response || error.response.status >= 500 || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('🔴 Error de API:', errorDetails)
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // No intentar renovar token en endpoints de autenticación (login, register)
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login/') || 
                          originalRequest.url?.includes('/api/auth/register/')

    // Si el error es 401 y no hemos intentado renovar el token (y no es endpoint de auth)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Si ya estamos renovando, agregar request a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenUtils.getRefreshToken()

      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir a login
        tokenUtils.clearTokens()
        processQueue(error, null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Intentar renovar el token (usar la misma baseURL del cliente)
        const response = await axios.post<{ access: string; refresh: string }>(
          `${apiClient.defaults.baseURL}/api/auth/refresh/`,
          { refresh: refreshToken }
        )

        const { access, refresh } = response.data

        // Guardar nuevos tokens
        tokenUtils.setAccessToken(access)
        tokenUtils.setRefreshToken(refresh)

        // Procesar cola de requests pendientes
        processQueue(null, access)

        // Reintentar el request original con el nuevo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }

        isRefreshing = false
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Error al renovar token, limpiar y rechazar
        tokenUtils.clearTokens()
        processQueue(refreshError as AxiosError, null)
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

