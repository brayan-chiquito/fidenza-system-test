import apiClient from './client'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterResponse,
} from '@/types/auth'

/**
 * Servicio de autenticación
 * Endpoints:
 * - POST /api/auth/register/ - Registrar nuevo usuario
 * - POST /api/auth/login/ - Iniciar sesión
 * - POST /api/auth/refresh/ - Renovar access token
 */

/**
 * Registra un nuevo usuario
 * @param data - Datos del usuario para registro
 * @returns Respuesta con mensaje y datos del usuario
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/api/auth/register/', data)
  return response.data
}

/**
 * Inicia sesión con email y contraseña
 * @param credentials - Email y contraseña
 * @returns Tokens JWT y datos del usuario
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login/', credentials)
  return response.data
}

/**
 * Renueva el access token usando el refresh token
 * @param refreshToken - Refresh token actual
 * @returns Nuevos tokens (access y refresh)
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const data: RefreshTokenRequest = { refresh: refreshToken }
  const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh/', data)
  return response.data
}

