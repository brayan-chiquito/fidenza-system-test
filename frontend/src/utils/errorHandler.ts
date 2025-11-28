/**
 * Utilidades para manejo de errores de API
 * Convierte errores técnicos en mensajes amigables para el usuario
 */

import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

/**
 * Obtiene un mensaje de error amigable desde un error de Axios
 */
export function getErrorMessage(error: unknown): string {
  // Si es un AxiosError
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>
    const status = axiosError.response?.status
    const errorData = axiosError.response?.data

    // Mensajes específicos por código de estado
    if (status === 401) {
      // Error de autenticación - mensaje genérico para no revelar información
      return 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
    }

    if (status === 400) {
      // Error de validación - intentar obtener mensaje del backend
      if (errorData?.detail) {
        return errorData.detail
      }
      if (errorData?.message) {
        return errorData.message
      }
      return 'Por favor, verifica los datos ingresados.'
    }

    if (status === 403) {
      return 'No tienes permisos para realizar esta acción.'
    }

    if (status === 404) {
      return 'El recurso solicitado no fue encontrado.'
    }

    if (status === 500) {
      return 'Error en el servidor. Por favor, intenta más tarde.'
    }

    if (status === 503) {
      return 'Servicio no disponible. Por favor, intenta más tarde.'
    }

    // Si hay un mensaje en el error del backend
    if (errorData?.detail) {
      return errorData.detail
    }

    if (errorData?.message) {
      return errorData.message
    }
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    // Filtrar mensajes técnicos de Axios
    const message = error.message

    // Mensajes técnicos que no queremos mostrar al usuario
    if (message.includes('status code 401')) {
      return 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
    }

    if (message.includes('status code 400')) {
      return 'Por favor, verifica los datos ingresados.'
    }

    if (message.includes('status code 500')) {
      return 'Error en el servidor. Por favor, intenta más tarde.'
    }

    if (message.includes('Network Error') || message.includes('timeout')) {
      return 'Error de conexión. Por favor, verifica tu conexión a internet.'
    }

    // Si es un mensaje genérico de error, usar un mensaje por defecto
    if (message.includes('Request failed')) {
      return 'Error al procesar la solicitud. Por favor, intenta nuevamente.'
    }
  }

  // Mensaje por defecto
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
}

