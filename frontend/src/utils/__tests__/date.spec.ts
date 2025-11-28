import { describe, it, expect } from 'vitest'
import { formatDate, formatDateShort, getRelativeDate } from '../date'

describe('formatDate', () => {
  it('debe formatear una fecha ISO a formato legible en español', () => {
    const isoDate = '2024-01-15T10:30:00Z'
    const formatted = formatDate(isoDate)
    
    expect(formatted).toMatch(/15.*enero.*2024|15.*january.*2024/i)
  })

  it('debe manejar diferentes formatos de fecha', () => {
    const isoDate = '2024-12-25T00:00:00Z'
    const formatted = formatDate(isoDate)
    
    expect(formatted).toMatch(/24.*diciembre.*2024|25.*diciembre.*2024/)
  })
})

describe('formatDateShort', () => {
  it('debe formatear una fecha ISO a formato corto', () => {
    const isoDate = '2024-01-15T10:30:00Z'
    const formatted = formatDateShort(isoDate)
    
    expect(formatted).toMatch(/15.*2024/)
  })
})

describe('getRelativeDate', () => {
  it('debe retornar "Hoy" para la fecha actual', () => {
    const today = new Date().toISOString()
    const relative = getRelativeDate(today)
    
    expect(relative).toBe('Hoy')
  })

  it('debe retornar "Mañana" para la fecha de mañana', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const relative = getRelativeDate(tomorrow.toISOString())
    
    expect(relative).toBe('Mañana')
  })

  it('debe retornar "Ayer" para la fecha de ayer', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const relative = getRelativeDate(yesterday.toISOString())
    
    expect(relative).toBe('Ayer')
  })

  it('debe retornar "En X días" para fechas futuras cercanas', () => {
    const future = new Date()
    future.setDate(future.getDate() + 3)
    const relative = getRelativeDate(future.toISOString())
    
    expect(relative).toBe('En 3 días')
  })

  it('debe retornar "Hace X días" para fechas pasadas cercanas', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    const relative = getRelativeDate(past.toISOString())
    
    expect(relative).toBe('Hace 5 días')
  })

  it('debe retornar fecha formateada para fechas lejanas', () => {
    const farFuture = new Date('2025-12-31T00:00:00Z')
    const relative = getRelativeDate(farFuture.toISOString())
    
    expect(relative).toMatch(/30.*dic.*2025|31.*dic.*2025|30.*dic.*2025/)
  })

  it('debe retornar fecha formateada para fechas muy pasadas', () => {
    const farPast = new Date('2020-01-01T00:00:00Z')
    const relative = getRelativeDate(farPast.toISOString())
    
    expect(relative).toMatch(/31.*dic.*2019|1.*ene.*2020/)
  })
})

