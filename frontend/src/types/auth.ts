/**
 * Tipos relacionados con autenticación
 * Basados en la API del backend
 */

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface RefreshTokenRequest {
  refresh: string
}

export interface RefreshTokenResponse {
  access: string
  refresh: string
}

export interface RegisterResponse {
  message: string
  user: User
}

