import apiClient from './client'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'
import type { PaginatedResponse } from '@/types/api'

/**
 * Servicio de tareas
 * Todos los endpoints requieren autenticación JWT
 * Endpoints:
 * - GET /api/tasks/ - Listar tareas (paginado)
 * - POST /api/tasks/ - Crear nueva tarea
 * - GET /api/tasks/{id}/ - Obtener tarea por ID
 * - PUT /api/tasks/{id}/ - Actualizar tarea completa
 * - PATCH /api/tasks/{id}/ - Actualizar tarea parcialmente
 * - DELETE /api/tasks/{id}/ - Eliminar tarea (soft delete)
 */

/**
 * Obtiene la lista de tareas del usuario autenticado (paginado)
 * @param page - Número de página (opcional, por defecto 1)
 * @returns Respuesta paginada con lista de tareas
 */
export async function getTasks(page: number = 1): Promise<PaginatedResponse<Task>> {
  const response = await apiClient.get<PaginatedResponse<Task>>('/api/tasks/', {
    params: { page },
  })
  return response.data
}

/**
 * Obtiene una tarea específica por su ID
 * @param id - ID de la tarea
 * @returns Tarea encontrada
 */
export async function getTask(id: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/api/tasks/${id}/`)
  return response.data
}

/**
 * Crea una nueva tarea
 * @param data - Datos de la tarea a crear
 * @returns Tarea creada
 */
export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post<Task>('/api/tasks/', data)
  return response.data
}

/**
 * Actualiza una tarea completamente
 * @param id - ID de la tarea a actualizar
 * @param data - Datos completos de la tarea
 * @returns Tarea actualizada
 */
export async function updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.put<Task>(`/api/tasks/${id}/`, data)
  return response.data
}

/**
 * Actualiza una tarea parcialmente (solo los campos enviados)
 * @param id - ID de la tarea a actualizar
 * @param data - Datos parciales de la tarea
 * @returns Tarea actualizada
 */
export async function patchTask(id: number, data: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.patch<Task>(`/api/tasks/${id}/`, data)
  return response.data
}

/**
 * Elimina una tarea (soft delete)
 * @param id - ID de la tarea a eliminar
 * @returns void (204 No Content)
 */
export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/api/tasks/${id}/`)
}

/**
 * Marca una tarea como completada o pendiente
 * @param id - ID de la tarea
 * @param completed - Estado de completado
 * @returns Tarea actualizada
 */
export async function toggleTaskComplete(id: number, completed: boolean): Promise<Task> {
  return patchTask(id, { completed })
}

