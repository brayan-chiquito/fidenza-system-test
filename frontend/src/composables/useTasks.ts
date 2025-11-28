import { computed, type Ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { formatDate, formatDateShort, getRelativeDate } from '@/utils/date'
import type { Task } from '@/types/task'

/**
 * Composable para tareas
 * Proporciona helpers, formateo y lógica reutilizable relacionada con tareas
 */
export function useTasks() {
  const tasksStore = useTasksStore()

  /**
   * Obtiene todas las tareas
   */
  const tasks = computed(() => tasksStore.tasks)

  /**
   * Obtiene las tareas pendientes
   */
  const pendingTasks = computed(() => tasksStore.pendingTasks)

  /**
   * Obtiene las tareas completadas
   */
  const completedTasks = computed(() => tasksStore.completedTasks)

  /**
   * Obtiene las estadísticas
   */
  const stats = computed(() => tasksStore.stats)

  /**
   * Verifica si hay tareas
   */
  const hasTasks = computed(() => tasksStore.hasTasks)

  /**
   * Obtiene el estado de carga
   */
  const isLoading = computed(() => tasksStore.loading)

  /**
   * Formatea la fecha de creación de una tarea
   */
  function formatCreatedDate(task: Task): string {
    return formatDate(task.created_at)
  }

  /**
   * Formatea la fecha de actualización de una tarea
   */
  function formatUpdatedDate(task: Task): string {
    return formatDate(task.updated_at)
  }

  /**
   * Obtiene una fecha relativa para una tarea
   */
  function getTaskRelativeDate(task: Task): string {
    return getRelativeDate(task.updated_at)
  }

  /**
   * Verifica si una tarea está completada
   */
  function isCompleted(task: Task): boolean {
    return task.completed
  }

  /**
   * Verifica si una tarea está pendiente
   */
  function isPending(task: Task): boolean {
    return !task.completed
  }

  /**
   * Obtiene el estado de una tarea en español
   */
  function getTaskStatus(task: Task): 'Completada' | 'Pendiente' {
    return task.completed ? 'Completada' : 'Pendiente'
  }

  /**
   * Obtiene las clases CSS para el badge de estado de una tarea
   */
  function getTaskStatusClasses(task: Task): string {
    if (task.completed) {
      return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
    }
    return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
  }

  /**
   * Busca tareas por texto
   */
  function searchTasks(query: string): Task[] {
    if (!query.trim()) {
      return tasksStore.tasks
    }

    const lowerQuery = query.toLowerCase()
    return tasksStore.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Filtra tareas por estado
   */
  function filterTasksByStatus(status: 'all' | 'completed' | 'pending'): Task[] {
    switch (status) {
      case 'completed':
        return tasksStore.completedTasks
      case 'pending':
        return tasksStore.pendingTasks
      default:
        return tasksStore.tasks
    }
  }

  /**
   * Obtiene una tarea por ID
   */
  function getTaskById(id: number): Task | undefined {
    return tasksStore.tasks.find((task) => task.id === id)
  }

  /**
   * Obtiene el porcentaje de completado
   */
  const completionPercentage = computed(() => {
    const total = tasksStore.stats.total
    if (total === 0) return 0
    return Math.round((tasksStore.stats.completed / total) * 100)
  })

  return {
    // Store (acceso directo a todas las acciones del store)
    store: tasksStore,
    // Computed
    tasks,
    pendingTasks,
    completedTasks,
    stats,
    hasTasks,
    isLoading,
    completionPercentage,
    // Helpers de formateo
    formatCreatedDate,
    formatUpdatedDate,
    getTaskRelativeDate,
    // Helpers de estado
    isCompleted,
    isPending,
    getTaskStatus,
    getTaskStatusClasses,
    // Helpers de búsqueda y filtrado
    searchTasks,
    filterTasksByStatus,
    getTaskById,
  }
}

