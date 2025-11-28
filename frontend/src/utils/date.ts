/**
 * Utilidades para formatear fechas
 */

/**
 * Formatea una fecha ISO 8601 a formato legible en español
 * @param isoDate - Fecha en formato ISO 8601 (ej: "2024-01-15T10:30:00Z")
 * @returns Fecha formateada (ej: "15 Enero, 2024")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha ISO 8601 a formato corto
 * @param isoDate - Fecha en formato ISO 8601
 * @returns Fecha formateada corta (ej: "15 Ene, 2024")
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Obtiene una fecha relativa (ej: "Hoy", "Mañana", "Hace 2 días")
 * @param isoDate - Fecha en formato ISO 8601
 * @returns Fecha relativa
 */
export function getRelativeDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays === -1) return 'Ayer'
  if (diffDays > 0 && diffDays <= 7) return `En ${diffDays} días`
  if (diffDays < 0 && diffDays >= -7) return `Hace ${Math.abs(diffDays)} días`

  // Si es muy lejos, mostrar fecha formateada
  return formatDateShort(isoDate)
}

