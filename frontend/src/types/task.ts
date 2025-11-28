/**
 * Tipos relacionados con tareas
 * Basados en la API del backend
 */

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  created_at: string // ISO 8601 format
  updated_at: string // ISO 8601 format
}

export interface CreateTaskRequest {
  title: string
  description?: string
  completed?: boolean
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  completed?: boolean
}

