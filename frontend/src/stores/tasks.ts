import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getTasks as apiGetTasks,
  getTask as apiGetTask,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  patchTask as apiPatchTask,
  deleteTask as apiDeleteTask,
  toggleTaskComplete as apiToggleTaskComplete,
} from '@/api/tasks'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'
import type { PaginatedResponse } from '@/types/api'

/**
 * Store de tareas
 * Maneja el estado de las tareas del usuario autenticado
 */
export const useTasksStore = defineStore('tasks', () => {
  // Estado
  const tasks: Ref<Task[]> = ref([])
  const currentTask: Ref<Task | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
  })

  // Getters
  /**
   * Tareas pendientes (no completadas)
   */
  const pendingTasks = computed(() => {
    return tasks.value.filter((task) => !task.completed)
  })

  /**
   * Tareas completadas
   */
  const completedTasks = computed(() => {
    return tasks.value.filter((task) => task.completed)
  })

  /**
   * Estadísticas de tareas
   */
  const stats = computed(() => {
    const total = tasks.value.length
    const completed = completedTasks.value.length
    const pending = pendingTasks.value.length

    return {
      total,
      completed,
      pending,
    }
  })

  /**
   * Verifica si hay tareas
   */
  const hasTasks = computed(() => {
    return tasks.value.length > 0
  })

  // Acciones
  /**
   * Carga las tareas del servidor (paginado)
   */
  async function fetchTasks(page: number = 1): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const response: PaginatedResponse<Task> = await apiGetTasks(page)

      tasks.value = response.results
      pagination.value = {
        count: response.count,
        next: response.next,
        previous: response.previous,
        currentPage: page,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tareas'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga una tarea específica por ID
   */
  async function fetchTask(id: number): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const task = await apiGetTask(id)
      currentTask.value = task

      // Actualizar la tarea en la lista si existe
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la tarea'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva tarea
   */
  async function createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      loading.value = true
      error.value = null

      const newTask = await apiCreateTask(data)

      // Agregar la nueva tarea al inicio de la lista
      tasks.value.unshift(newTask)
      pagination.value.count += 1

      return newTask
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la tarea'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async function updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    try {
      loading.value = true
      error.value = null

      const updatedTask = await apiUpdateTask(id, data)

      // Actualizar en la lista
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }

      // Actualizar currentTask si es la misma
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }

      return updatedTask
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la tarea'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza parcialmente una tarea (PATCH)
   */
  async function patchTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    try {
      loading.value = true
      error.value = null

      const updatedTask = await apiPatchTask(id, data)

      // Actualizar en la lista
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }

      // Actualizar currentTask si es la misma
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }

      return updatedTask
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la tarea'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una tarea
   */
  async function deleteTask(id: number): Promise<void> {
    try {
      loading.value = true
      error.value = null

      await apiDeleteTask(id)

      // Remover de la lista
      tasks.value = tasks.value.filter((t) => t.id !== id)

      // Limpiar currentTask si es la eliminada
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }

      pagination.value.count -= 1
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la tarea'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambia el estado completado de una tarea
   */
  async function toggleComplete(id: number): Promise<Task> {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) {
      throw new Error('Tarea no encontrada')
    }

    return patchTask(id, { completed: !task.completed })
  }

  /**
   * Establece la tarea actual (para ver/editar)
   */
  function setCurrentTask(task: Task | null): void {
    currentTask.value = task
  }

  /**
   * Limpia el estado del store
   */
  function clearTasks(): void {
    tasks.value = []
    currentTask.value = null
    pagination.value = {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
    }
    error.value = null
  }

  /**
   * Limpia el error
   */
  function clearError(): void {
    error.value = null
  }

  return {
    // Estado
    tasks,
    currentTask,
    loading,
    error,
    pagination,
    // Getters
    pendingTasks,
    completedTasks,
    stats,
    hasTasks,
    // Acciones
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    toggleComplete,
    setCurrentTask,
    clearTasks,
    clearError,
  }
})

