<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import Modal from '@/components/ui/Modal.vue'
import Drawer from '@/components/ui/Drawer.vue'
import { formatDate } from '@/utils/date'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

// Modal states
const isNewTaskOpen = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)
const viewingTask = ref<Task | null>(null)

// Form data
const newTaskForm = ref<CreateTaskRequest>({
  title: '',
  description: '',
})
const editTaskForm = ref<UpdateTaskRequest>({})

/**
 * Carga las tareas al montar el componente
 */
onMounted(async () => {
  try {
    await tasksStore.fetchTasks()
  } catch (error) {
    console.error('Error al cargar tareas:', error)
  }
})

/**
 * Maneja el logout
 */
function handleLogout(): void {
  authStore.logout()
  tasksStore.clearTasks()
  router.push('/login')
}

/**
 * Abre el modal para crear nueva tarea
 */
function openNewTaskModal(): void {
  newTaskForm.value = { title: '', description: '' }
  isNewTaskOpen.value = true
}

/**
 * Maneja la creación de una nueva tarea
 */
async function handleCreateTask(event: Event): Promise<void> {
  event.preventDefault()

  if (!newTaskForm.value.title) return

  try {
    await tasksStore.createTask({
      title: newTaskForm.value.title,
      description: newTaskForm.value.description || '',
    })
    isNewTaskOpen.value = false
    newTaskForm.value = { title: '', description: '' }
  } catch (error) {
    console.error('Error al crear tarea:', error)
  }
}

/**
 * Abre el modal de edición
 */
function openEditModal(task: Task): void {
  editingTask.value = task
  editTaskForm.value = {
    title: task.title,
    description: task.description,
  }
  viewingTask.value = null // Cerrar drawer si está abierto
}

/**
 * Maneja la actualización de una tarea
 */
async function handleUpdateTask(event: Event): Promise<void> {
  event.preventDefault()

  if (!editingTask.value || !editTaskForm.value.title) return

  try {
    await tasksStore.updateTask(editingTask.value.id, {
      title: editTaskForm.value.title,
      description: editTaskForm.value.description || '',
      completed: editingTask.value.completed,
    })
    editingTask.value = null
    editTaskForm.value = {}
  } catch (error) {
    console.error('Error al actualizar tarea:', error)
  }
}

/**
 * Cambia el estado completado en el modal de edición
 */
function toggleEditTaskCompleted(): void {
  if (editingTask.value) {
    editingTask.value = {
      ...editingTask.value,
      completed: !editingTask.value.completed,
    }
  }
}

/**
 * Maneja la eliminación de una tarea
 */
async function handleDeleteTask(): Promise<void> {
  if (!deletingTask.value) return

  try {
    await tasksStore.deleteTask(deletingTask.value.id)
    deletingTask.value = null
    if (viewingTask.value?.id === deletingTask.value?.id) {
      viewingTask.value = null
    }
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
  }
}

/**
 * Cambia el estado completado de una tarea
 */
async function toggleTaskComplete(task: Task): Promise<void> {
  try {
    await tasksStore.toggleComplete(task.id)
  } catch (error) {
    console.error('Error al cambiar estado de tarea:', error)
  }
}

/**
 * Abre el drawer para ver detalles de una tarea
 */
function openTaskDetails(task: Task): void {
  viewingTask.value = task
}

/**
 * Abre el modal de edición desde el drawer
 */
function editFromDrawer(): void {
  if (viewingTask.value) {
    openEditModal(viewingTask.value)
  }
}

/**
 * Abre el modal de eliminación desde el drawer
 */
function deleteFromDrawer(): void {
  if (viewingTask.value) {
    deletingTask.value = viewingTask.value
    viewingTask.value = null // Cerrar el drawer, igual que al editar
  }
}

// Computed para obtener nombre del usuario
const userName = computed(() => {
  return authStore.user?.first_name || 'Usuario'
})
</script>

<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <div class="flex flex-1 justify-center p-4 sm:p-6 md:p-8">
        <div class="layout-content-container flex flex-col w-full max-w-4xl flex-1 gap-6">
          <!-- Header -->
          <header
            class="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-700 px-4 py-3 sm:px-6"
          >
            <div class="flex items-center gap-4 text-slate-900 dark:text-slate-50">
              <div class="size-6 text-primary">
                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.25 5.25h-15a.75.75 0 0 1 0-1.5h15a.75.75 0 0 1 0 1.5Zm-9 6h-6a.75.75 0 0 1 0-1.5h6a.75.75 0 0 1 0 1.5Zm9 6h-15a.75.75 0 0 1 0-1.5h15a.75.75 0 0 1 0 1.5Z"
                  ></path>
                  <path
                    clip-rule="evenodd"
                    d="m8.25 15.75-2.25-2.25a.75.75 0 0 1 1.06-1.06l1.72 1.72 3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z"
                    fill-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <h1 class="text-lg font-bold leading-tight tracking-tight">Dashboard de Tareas</h1>
            </div>
            <div class="flex items-center gap-4">
              <button
                @click="handleLogout"
                class="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors"
              >
                <span class="truncate">Cerrar sesión</span>
              </button>
              <div
                class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-200 dark:border-slate-700"
                style="background-image: url('https://picsum.photos/100/100')"
              ></div>
            </div>
          </header>

          <main class="flex flex-col gap-6">
            <!-- Page Heading -->
            <div class="flex flex-wrap justify-between items-center gap-4 px-4 sm:px-0">
              <div class="flex flex-col gap-1">
                <p class="text-slate-900 dark:text-slate-50 text-3xl font-black leading-tight tracking-tighter">
                  Hola, {{ userName }}
                </p>
                <p class="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                  Vamos a organizar tu día.
                </p>
              </div>
              <button
                @click="openNewTaskModal"
                class="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-md hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span class="material-symbols-outlined text-xl">add</span>
                <span class="truncate">Nueva Tarea</span>
              </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4 sm:px-0">
              <div
                class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">
                  Total de tareas
                </p>
                <p class="text-slate-900 dark:text-slate-50 tracking-tight text-3xl font-bold leading-tight">
                  {{ tasksStore.stats.total }}
                </p>
              </div>
              <div
                class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">
                  Tareas completadas
                </p>
                <p class="text-green-500 tracking-tight text-3xl font-bold leading-tight">
                  {{ tasksStore.stats.completed }}
                </p>
              </div>
              <div
                class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <p class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">
                  Tareas pendientes
                </p>
                <p class="text-amber-500 tracking-tight text-3xl font-bold leading-tight">
                  {{ tasksStore.stats.pending }}
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="tasksStore.loading && !tasksStore.hasTasks" class="flex justify-center p-12">
              <span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            </div>

            <!-- Task List -->
            <div v-else class="flex flex-col gap-6">
              <!-- Pending Tasks -->
              <div v-if="tasksStore.pendingTasks.length > 0" class="flex flex-col gap-4">
                <h2
                  class="text-slate-900 dark:text-slate-50 text-xl font-bold leading-tight tracking-tight px-4 sm:px-0"
                >
                  Tareas Pendientes
                </h2>
                <div
                  class="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 max-h-[320px] overflow-y-auto"
                >
                  <div
                    v-for="task in tasksStore.pendingTasks"
                    :key="task.id"
                    class="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="task.completed"
                      @change="toggleTaskComplete(task)"
                      class="h-5 w-5 rounded-md border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                    />
                    <div
                      class="flex-1 cursor-pointer"
                      @click="openTaskDetails(task)"
                    >
                      <p class="text-slate-800 dark:text-slate-200 font-semibold">{{ task.title }}</p>
                      <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">
                        {{ task.description || 'Sin descripción' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        @click="openEditModal(task)"
                        class="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <span class="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        @click="deletingTask = task"
                        class="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Completed Tasks -->
              <div v-if="tasksStore.completedTasks.length > 0" class="flex flex-col gap-4">
                <h2
                  class="text-slate-900 dark:text-slate-50 text-xl font-bold leading-tight tracking-tight px-4 sm:px-0"
                >
                  Completadas
                </h2>
                <div
                  class="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 max-h-[240px] overflow-y-auto"
                >
                  <div
                    v-for="task in tasksStore.completedTasks"
                    :key="task.id"
                    class="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="task.completed"
                      @change="toggleTaskComplete(task)"
                      class="h-5 w-5 rounded-md border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                    />
                    <div
                      class="flex-1 cursor-pointer"
                      @click="openTaskDetails(task)"
                    >
                      <p class="text-slate-500 dark:text-slate-500 font-semibold line-through">
                        {{ task.title }}
                      </p>
                      <p class="text-slate-400 dark:text-slate-600 text-sm line-through line-clamp-1">
                        {{ task.description || 'Sin descripción' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        @click="toggleTaskComplete(task)"
                        class="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <span class="material-symbols-outlined text-lg">undo</span>
                      </button>
                      <button
                        @click="deletingTask = task"
                        class="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="!tasksStore.hasTasks && !tasksStore.loading"
                class="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-12 text-center"
              >
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span class="material-symbols-outlined text-4xl">checklist</span>
                </div>
                <div class="flex flex-col gap-1">
                  <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    ¡Todo listo por ahora!
                  </h3>
                  <p class="text-slate-500 dark:text-slate-400">
                    No tienes tareas pendientes. Añade una nueva para empezar.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>

    <!-- New Task Modal -->
    <Modal :is-open="isNewTaskOpen" @close="isNewTaskOpen = false" title="Nueva Tarea">
      <form @submit="handleCreateTask" class="flex flex-col gap-6 p-6">
        <label class="flex flex-col w-full">
          <p class="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal pb-2">
            Título de la tarea <span class="text-red-500">*</span>
          </p>
          <input
            v-model="newTaskForm.title"
            required
            class="w-full h-12 px-4 text-base font-normal leading-normal rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary"
            placeholder="Comprar entradas para el concierto"
          />
        </label>
        <label class="flex flex-col w-full">
          <p class="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal pb-2">
            Descripción (opcional)
          </p>
          <textarea
            v-model="newTaskForm.description"
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 min-h-32 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
            placeholder="Recordar revisar las fechas y precios antes de comprar."
          ></textarea>
        </label>
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="isNewTaskOpen = false"
            class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span class="truncate">Cancelar</span>
          </button>
          <button
            type="submit"
            class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white hover:bg-primary/90 text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span class="truncate">Crear Tarea</span>
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit Task Modal -->
    <Modal
      :is-open="!!editingTask"
      @close="editingTask = null"
      title="Editar Tarea"
    >
      <form v-if="editingTask" @submit="handleUpdateTask" class="flex flex-col gap-6 p-6">
        <label class="flex flex-col w-full">
          <p class="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal pb-2">
            Título de la tarea
          </p>
          <input
            v-model="editTaskForm.title"
            required
            class="w-full h-12 px-4 text-base font-normal leading-normal rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary"
          />
        </label>
        <label class="flex flex-col w-full">
          <p class="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal pb-2">
            Descripción
          </p>
          <textarea
            v-model="editTaskForm.description"
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 min-h-32 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-4 text-base font-normal leading-normal"
          ></textarea>
        </label>

        <div class="flex items-center justify-between gap-4 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <p class="flex-1 truncate text-base font-normal leading-normal text-slate-900 dark:text-white">
            Marcar como completada
          </p>
          <div class="shrink-0">
            <label
              class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-slate-300 p-0.5 dark:bg-slate-600"
              :class="{ 'bg-primary': editingTask.completed }"
            >
              <div
                class="h-full w-[27px] rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm"
                :class="editingTask.completed ? 'translate-x-[20px]' : 'translate-x-0'"
              ></div>
              <input
                type="checkbox"
                class="invisible absolute"
                :checked="editingTask.completed"
                @change="toggleEditTaskCompleted"
              />
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="editingTask = null"
            class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span class="truncate">Cancelar</span>
          </button>
          <button
            type="submit"
            class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white hover:bg-primary/90 text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span class="truncate">Guardar Cambios</span>
          </button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      :is-open="!!deletingTask"
      @close="deletingTask = null"
      :show-close-button="false"
    >
      <div class="flex flex-col items-center p-6 sm:p-8">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 mb-4"
        >
          <span class="material-symbols-outlined text-4xl text-red-500 dark:text-red-400"
            >warning</span
          >
        </div>
        <h3
          class="text-[#0d131c] dark:text-white tracking-light text-xl font-bold leading-tight text-center pb-2 pt-2"
        >
          ¿Eliminar esta tarea?
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal text-center">
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div
        class="flex flex-col sm:flex-row justify-stretch gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1C2532]/50 rounded-b-xl"
      >
        <button
          @click="deletingTask = null"
          class="flex w-full sm:w-1/2 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <span class="truncate">Cancelar</span>
        </button>
        <button
          @click="handleDeleteTask"
          class="flex w-full sm:w-1/2 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-700"
        >
          <span class="truncate">Sí, eliminar</span>
        </button>
      </div>
    </Modal>

    <!-- Task Viewer Drawer -->
    <Drawer
      :is-open="!!viewingTask"
      @close="viewingTask = null"
      title="Detalle de la Tarea"
    >
      <template v-if="viewingTask">
        <div class="flex flex-col h-full">
          <div class="flex-1 p-4 sm:p-6 flex flex-col gap-4">
            <h1
              class="text-slate-900 dark:text-slate-50 tracking-tight text-2xl sm:text-3xl font-bold leading-tight"
            >
              {{ viewingTask.title }}
            </h1>
            <div class="flex gap-3">
              <div
                class="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full px-3"
                :class="
                  viewingTask.completed
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                "
              >
                <p class="text-sm font-medium leading-normal">
                  {{ viewingTask.completed ? 'Completada' : 'Pendiente' }}
                </p>
              </div>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
              {{ viewingTask.description || 'Sin descripción.' }}
            </p>
            <div class="pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
              <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
                <p class="text-slate-500 dark:text-slate-500 text-sm font-normal">Creada:</p>
                <p class="text-slate-800 dark:text-slate-200 text-sm font-medium">
                  {{ formatDate(viewingTask.created_at) }}
                </p>
                <p class="text-slate-500 dark:text-slate-500 text-sm font-normal">
                  Última actualización:
                </p>
                <p class="text-slate-800 dark:text-slate-200 text-sm font-medium">
                  {{ formatDate(viewingTask.updated_at) }}
                </p>
              </div>
            </div>
          </div>
          <footer
            class="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 dark:border-slate-800 p-4 sm:px-6 mt-auto"
          >
            <button
              @click="viewingTask = null"
              class="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            >
              Cerrar
            </button>
            <button
              @click="deleteFromDrawer"
              class="px-4 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            >
              Eliminar
            </button>
            <button
              @click="editFromDrawer"
              class="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            >
              Editar
            </button>
          </footer>
        </div>
      </template>
    </Drawer>
  </div>
</template>

