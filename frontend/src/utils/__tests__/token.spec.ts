import { describe, it, expect, beforeEach } from 'vitest'
import { tokenUtils } from '../token'
import type { User } from '@/types/auth'

describe('tokenUtils', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
  })

  describe('setAccessToken y getAccessToken', () => {
    it('debe guardar y obtener el access token', () => {
      const token = 'test-access-token-123'
      
      tokenUtils.setAccessToken(token)
      const retrieved = tokenUtils.getAccessToken()
      
      expect(retrieved).toBe(token)
    })

    it('debe retornar null si no hay access token guardado', () => {
      const retrieved = tokenUtils.getAccessToken()
      
      expect(retrieved).toBeNull()
    })
  })

  describe('setRefreshToken y getRefreshToken', () => {
    it('debe guardar y obtener el refresh token', () => {
      const token = 'test-refresh-token-456'
      
      tokenUtils.setRefreshToken(token)
      const retrieved = tokenUtils.getRefreshToken()
      
      expect(retrieved).toBe(token)
    })

    it('debe retornar null si no hay refresh token guardado', () => {
      const retrieved = tokenUtils.getRefreshToken()
      
      expect(retrieved).toBeNull()
    })
  })

  describe('setUser y getUser', () => {
    it('debe guardar y obtener el usuario', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      }
      
      tokenUtils.setUser(user)
      const retrieved = tokenUtils.getUser()
      
      expect(retrieved).toEqual(user)
    })

    it('debe retornar null si no hay usuario guardado', () => {
      const retrieved = tokenUtils.getUser()
      
      expect(retrieved).toBeNull()
    })

    it('debe retornar null si el JSON es inválido', () => {
      localStorage.setItem('user', 'invalid-json')
      
      const retrieved = tokenUtils.getUser()
      
      expect(retrieved).toBeNull()
    })
  })

  describe('clearTokens', () => {
    it('debe eliminar todos los tokens y el usuario', () => {
      tokenUtils.setAccessToken('access-token')
      tokenUtils.setRefreshToken('refresh-token')
      tokenUtils.setUser({
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: true,
      })
      
      tokenUtils.clearTokens()
      
      expect(tokenUtils.getAccessToken()).toBeNull()
      expect(tokenUtils.getRefreshToken()).toBeNull()
      expect(tokenUtils.getUser()).toBeNull()
    })
  })

  describe('hasTokens', () => {
    it('debe retornar true si hay access y refresh token', () => {
      tokenUtils.setAccessToken('access-token')
      tokenUtils.setRefreshToken('refresh-token')
      
      expect(tokenUtils.hasTokens()).toBe(true)
    })

    it('debe retornar false si falta access token', () => {
      tokenUtils.setRefreshToken('refresh-token')
      
      expect(tokenUtils.hasTokens()).toBe(false)
    })

    it('debe retornar false si falta refresh token', () => {
      tokenUtils.setAccessToken('access-token')
      
      expect(tokenUtils.hasTokens()).toBe(false)
    })

    it('debe retornar false si no hay tokens', () => {
      expect(tokenUtils.hasTokens()).toBe(false)
    })
  })
})

