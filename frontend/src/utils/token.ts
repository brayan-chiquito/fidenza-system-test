/**
 * Utilidades para manejo de tokens JWT en localStorage
 * 
 * NOTA DE SEGURIDAD:
 * - localStorage es vulnerable a ataques XSS (Cross-Site Scripting)
 * - Para esta prueba técnica es aceptable, pero en producción se recomienda:
 *   1. httpOnly Cookies: Protección contra XSS, requiere cambios en backend
 *   2. sessionStorage: Se limpia al cerrar pestaña (mejor que localStorage)
 *   3. Memory storage: Máxima seguridad pero se pierde al recargar
 * 
 * Mitigaciones actuales:
 * - Tokens con expiración corta (access: 24h, refresh: 7 días)
 * - Rotación de refresh tokens habilitada
 * - CORS configurado correctamente
 * - Content Security Policy recomendado para producción
 */

import type { User } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export const tokenUtils = {
  /**
   * Guarda el access token en localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  /**
   * Obtiene el access token de localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  /**
   * Guarda el refresh token en localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  /**
   * Obtiene el refresh token de localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Guarda el usuario en localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * Obtiene el usuario de localStorage
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  /**
   * Elimina tokens y usuario de localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Verifica si hay tokens guardados
   */
  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken()
  },
}

