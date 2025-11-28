import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../tasks'
import * as tasksApi from '@/api/tasks'
import type { Task } from '@/types/task'

// Mock de las funciones de API
vi.mock('@/api/tasks', () => ({
  getTasks: vi.fn(),
  getTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  patchTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskComplete: vi.fn(),
}))

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockTask: Task = {
    id: 1,
    title: 'Tarea de prueba',
    description: 'Descripción de prueba',
    completed: false,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  }

  const mockCompletedTask: Task = {
    id: 2,
    title: 'Tarea completada',
    description: 'Descripción',
    completed: true,
    created_at: '2024-01-14T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  }

  describe('Estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const store = useTasksStore()

      expect(store.tasks).toEqual([])
      expect(store.currentTask).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.pendingTasks).toEqual([])
      expect(store.completedTasks).toEqual([])
      expect(store.hasTasks).toBe(false)
      expect(store.stats.total).toBe(0)
    })
  })

  describe('fetchTasks', () => {
    it('debe cargar tareas correctamente', async () => {
      const store = useTasksStore()
      const mockResponse = {
        count: 2,
        next: null,
        previous: null,
        results: [mockTask, mockCompletedTask],
      }

      vi.mocked(tasksApi.getTasks).mockResolvedValue(mockResponse)

      await store.fetchTasks()

      expect(store.tasks).toHaveLength(2)
      expect(store.tasks[0]).toEqual(mockTask)
      expect(store.pagination.count).toBe(2)
      expect(store.loading).toBe(false)
    })

    it('debe manejar errores al cargar tareas', async () => {
      const store = useTasksStore()
      const error = new Error('Error al cargar tareas')

      vi.mocked(tasksApi.getTasks).mockRejectedValue(error)

      await expect(store.fetchTasks()).rejects.toThrow()

      expect(store.error).toBe('Error al cargar tareas')
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchTask', () => {
    it('debe cargar una tarea específica', async () => {
      const store = useTasksStore()

      vi.mocked(tasksApi.getTask).mockResolvedValue(mockTask)

      await store.fetchTask(1)

      expect(store.currentTask).toEqual(mockTask)
      expect(store.loading).toBe(false)
    })

    it('debe actualizar la tarea en la lista si existe', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      const updatedTask = { ...mockTask, title: 'Título actualizado' }

      vi.mocked(tasksApi.getTask).mockResolvedValue(updatedTask)

      await store.fetchTask(1)

      expect(store.tasks[0].title).toBe('Título actualizado')
    })
  })

  describe('createTask', () => {
    it('debe crear una nueva tarea', async () => {
      const store = useTasksStore()

      vi.mocked(tasksApi.createTask).mockResolvedValue(mockTask)

      const result = await store.createTask({
        title: 'Nueva tarea',
        description: 'Descripción',
      })

      expect(result).toEqual(mockTask)
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]).toEqual(mockTask)
      expect(store.pagination.count).toBe(1)
      expect(store.loading).toBe(false)
    })

    it('debe manejar errores al crear tarea', async () => {
      const store = useTasksStore()
      const error = new Error('Error al crear tarea')

      vi.mocked(tasksApi.createTask).mockRejectedValue(error)

      await expect(
        store.createTask({
          title: 'Nueva tarea',
        })
      ).rejects.toThrow()

      expect(store.error).toBe('Error al crear tarea')
    })
  })

  describe('updateTask', () => {
    it('debe actualizar una tarea existente', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      const updatedTask = { ...mockTask, title: 'Título actualizado' }

      vi.mocked(tasksApi.updateTask).mockResolvedValue(updatedTask)

      const result = await store.updateTask(1, { title: 'Título actualizado' })

      expect(result).toEqual(updatedTask)
      expect(store.tasks[0].title).toBe('Título actualizado')
    })

    it('debe actualizar currentTask si es la misma tarea', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      store.currentTask = { ...mockTask }
      const updatedTask = { ...mockTask, title: 'Actualizado' }

      vi.mocked(tasksApi.updateTask).mockResolvedValue(updatedTask)

      await store.updateTask(1, { title: 'Actualizado' })

      expect(store.currentTask?.title).toBe('Actualizado')
    })
  })

  describe('deleteTask', () => {
    it('debe eliminar una tarea', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      store.pagination.count = 1

      vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined)

      await store.deleteTask(1)

      expect(store.tasks).toHaveLength(0)
      expect(store.pagination.count).toBe(0)
      expect(store.loading).toBe(false)
    })

    it('debe limpiar currentTask si es la tarea eliminada', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      store.currentTask = { ...mockTask }

      vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined)

      await store.deleteTask(1)

      expect(store.currentTask).toBeNull()
    })
  })

  describe('toggleComplete', () => {
    it('debe cambiar el estado de completado', async () => {
      const store = useTasksStore()
      store.tasks = [{ ...mockTask }]
      const toggledTask = { ...mockTask, completed: true }

      vi.mocked(tasksApi.patchTask).mockResolvedValue(toggledTask)

      await store.toggleComplete(1)

      expect(store.tasks[0].completed).toBe(true)
    })

    it('debe lanzar error si la tarea no existe', async () => {
      const store = useTasksStore()

      await expect(store.toggleComplete(999)).rejects.toThrow('Tarea no encontrada')
    })
  })

  describe('pendingTasks y completedTasks', () => {
    it('debe filtrar tareas pendientes correctamente', () => {
      const store = useTasksStore()
      store.tasks = [mockTask, mockCompletedTask]

      expect(store.pendingTasks).toHaveLength(1)
      expect(store.pendingTasks[0].id).toBe(1)
    })

    it('debe filtrar tareas completadas correctamente', () => {
      const store = useTasksStore()
      store.tasks = [mockTask, mockCompletedTask]

      expect(store.completedTasks).toHaveLength(1)
      expect(store.completedTasks[0].id).toBe(2)
    })
  })

  describe('stats', () => {
    it('debe calcular estadísticas correctamente', () => {
      const store = useTasksStore()
      store.tasks = [mockTask, mockCompletedTask]

      expect(store.stats.total).toBe(2)
      expect(store.stats.completed).toBe(1)
      expect(store.stats.pending).toBe(1)
    })
  })

  describe('clearTasks', () => {
    it('debe limpiar todas las tareas', () => {
      const store = useTasksStore()
      store.tasks = [mockTask, mockCompletedTask]
      store.currentTask = mockTask
      store.pagination.count = 2
      store.error = 'Error'

      store.clearTasks()

      expect(store.tasks).toEqual([])
      expect(store.currentTask).toBeNull()
      expect(store.pagination.count).toBe(0)
      expect(store.error).toBeNull()
    })
  })

  describe('setCurrentTask', () => {
    it('debe establecer la tarea actual', () => {
      const store = useTasksStore()

      store.setCurrentTask(mockTask)

      expect(store.currentTask).toEqual(mockTask)
    })

    it('debe limpiar la tarea actual si se pasa null', () => {
      const store = useTasksStore()
      store.currentTask = mockTask

      store.setCurrentTask(null)

      expect(store.currentTask).toBeNull()
    })
  })

  describe('clearError', () => {
    it('debe limpiar el error', () => {
      const store = useTasksStore()
      store.error = 'Error de prueba'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })
})

