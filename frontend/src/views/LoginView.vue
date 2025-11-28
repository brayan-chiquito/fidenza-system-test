<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// UI state
const showPassword = ref(false)
const isSubmitting = ref(false)

// CSS variable for checkbox SVG
const checkboxTickSvg = computed(() => ({
  '--checkbox-tick-svg': "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')",
}))

/**
 * Maneja el envío del formulario de login
 */
async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault()

  if (!email.value || !password.value) {
    return
  }

  try {
    isSubmitting.value = true
    authStore.clearError()

    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // Limpiar tareas anteriores del store
    tasksStore.clearTasks()

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    // Error manejado por el store
    console.error('Error al iniciar sesión:', error)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Toggle mostrar/ocultar contraseña
 */
function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div
    class="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark group/design-root"
    :style="checkboxTickSvg"
  >
    <div class="w-full max-w-md p-6">
      <div
        class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800/80 dark:bg-background-dark"
      >
        <!-- Logo y Título -->
        <div class="mb-6 flex flex-col items-center text-center">
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <span class="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Iniciar Sesión
          </h1>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Bienvenido de nuevo, ingresa tus datos.
          </p>
        </div>

        <!-- Mensaje de error -->
        <div v-if="authStore.error" class="mb-4 w-full rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <p class="text-sm text-red-600 dark:text-red-400">{{ authStore.error }}</p>
        </div>

        <!-- Formulario -->
        <div class="w-full">
          <form @submit="handleSubmit" class="flex w-full flex-col gap-y-4">
            <!-- Email -->
            <label class="flex flex-col">
              <p class="pb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Correo Electrónico
              </p>
              <div class="relative flex w-full flex-1 items-stretch">
                <span
                  class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                >
                  mail
                </span>
                <input
                  v-model="email"
                  class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-zinc-300 bg-background-light py-2.5 pl-11 pr-4 text-sm font-normal text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-background-dark/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="tu@email.com"
                  type="email"
                  required
                  :disabled="isSubmitting"
                />
              </div>
            </label>

            <!-- Password -->
            <label class="flex flex-col">
              <p class="pb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">Contraseña</p>
              <div class="relative flex w-full flex-1 items-stretch">
                <span
                  class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                >
                  lock
                </span>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-zinc-300 bg-background-light py-2.5 pl-11 pr-11 text-sm font-normal text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-background-dark/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="Introduce tu contraseña"
                  required
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  :disabled="isSubmitting"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </label>

            <!-- Remember me y Forgot password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-x-2">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-4 w-4 rounded border-2 border-zinc-300 bg-transparent text-primary checked:border-primary checked:bg-primary checked:bg-[image:--checkbox-tick-svg] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 dark:border-zinc-600 dark:checked:border-primary"
                  :disabled="isSubmitting"
                />
                <p class="text-sm font-normal text-zinc-600 dark:text-zinc-300">Recordarme</p>
              </label>
              <a href="#" class="text-sm font-medium text-primary hover:underline"
                >¿Olvidaste tu contraseña?</a
              >
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              :disabled="isSubmitting || !email || !password"
              class="flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="!isSubmitting">Iniciar Sesión</span>
              <span v-else class="flex items-center gap-2">
                <span class="material-symbols-outlined animate-spin">sync</span>
                Iniciando...
              </span>
            </button>
          </form>
        </div>

        <!-- Link a registro -->
        <div class="mt-6 w-full text-center">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            ¿No tienes una cuenta?
            <RouterLink to="/register" class="font-semibold text-primary hover:underline"
              >Regístrate aquí</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

