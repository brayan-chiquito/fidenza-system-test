<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

// Form data
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const acceptTerms = ref(false)

// UI state
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isSubmitting = ref(false)

/**
 * Calcula la fortaleza de la contraseña
 */
const passwordStrength = computed(() => {
  const pass = password.value
  if (!pass) return { level: 0, label: '', width: '0%' }

  let strength = 0
  if (pass.length >= 8) strength++
  if (/[a-z]/.test(pass)) strength++
  if (/[A-Z]/.test(pass)) strength++
  if (/[0-9]/.test(pass)) strength++
  if (/[^a-zA-Z0-9]/.test(pass)) strength++

  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const widths = ['20%', '40%', '60%', '80%', '100%']

  return {
    level: strength,
    label: labels[strength - 1] || '',
    width: widths[strength - 1] || '0%',
    color: colors[strength - 1] || 'bg-gray-500',
  }
})

/**
 * Verifica si las contraseñas coinciden
 */
const passwordsMatch = computed(() => {
  if (!password.value || !passwordConfirm.value) return true
  return password.value === passwordConfirm.value
})

/**
 * Verifica si el formulario es válido
 */
const isFormValid = computed(() => {
  return (
    firstName.value &&
    lastName.value &&
    email.value &&
    password.value &&
    passwordConfirm.value &&
    passwordsMatch.value &&
    acceptTerms.value
  )
})

/**
 * Maneja el envío del formulario de registro
 */
async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault()

  if (!isFormValid.value) {
    return
  }

  if (password.value !== passwordConfirm.value) {
    return
  }

  try {
    isSubmitting.value = true
    authStore.clearError()

    await authStore.register({
      email: email.value,
      password: password.value,
      password_confirm: passwordConfirm.value,
      first_name: firstName.value,
      last_name: lastName.value,
    })

    // Limpiar tareas anteriores del store
    tasksStore.clearTasks()

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    // Error manejado por el store
    console.error('Error al registrar usuario:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden p-4 sm:p-6 lg:p-8"
  >
    <div class="layout-container flex h-full grow flex-col w-full max-w-md">
      <div class="flex flex-col items-center gap-6">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-primary text-4xl">task_alt</span>
          <span class="text-2xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </div>

        <!-- Page Heading -->
        <div class="text-center">
          <p
            class="text-gray-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]"
          >
            Crear cuenta
          </p>
          <p class="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal mt-2">
            Empieza a organizar tus tareas hoy
          </p>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="authStore.error" class="mt-4 w-full rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
        <p class="text-sm text-red-600 dark:text-red-400">{{ authStore.error }}</p>
      </div>

      <!-- Registration Form -->
      <form @submit="handleSubmit" class="mt-8 flex flex-col gap-4">
        <!-- Name Fields -->
        <div class="flex flex-col sm:flex-row items-end gap-4">
          <label class="flex flex-col min-w-40 flex-1">
            <p
              class="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2"
            >
              Nombre
            </p>
            <input
              v-model="firstName"
              required
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary dark:focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
              placeholder="Ingresa tu nombre"
              :disabled="isSubmitting"
            />
          </label>
          <label class="flex flex-col min-w-40 flex-1">
            <p
              class="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2"
            >
              Apellido
            </p>
            <input
              v-model="lastName"
              required
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary dark:focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
              placeholder="Ingresa tu apellido"
              :disabled="isSubmitting"
            />
          </label>
        </div>

        <!-- Email Field -->
        <label class="flex flex-col min-w-40 flex-1">
          <p class="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
            Email
          </p>
          <input
            v-model="email"
            required
            type="email"
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary dark:focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
            placeholder="tu.email@ejemplo.com"
            :disabled="isSubmitting"
          />
        </label>

        <!-- Password Field -->
        <label class="flex flex-col min-w-40 flex-1">
          <p class="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
            Contraseña
          </p>
          <div class="relative">
            <input
              v-model="password"
              required
              :type="showPassword ? 'text' : 'password'"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary dark:focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pr-12 text-base font-normal leading-normal"
              placeholder="Crea una contraseña segura"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              :disabled="isSubmitting"
            >
              <span class="material-symbols-outlined">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </label>

        <!-- Password Strength Indicator -->
        <div v-if="password" class="flex gap-2 items-center">
          <div class="w-1/3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              :class="passwordStrength.color"
              class="h-full rounded-full transition-all duration-300"
              :style="{ width: passwordStrength.width }"
            ></div>
          </div>
          <div class="w-1/3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="w-1/3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <p class="text-xs text-gray-500 dark:text-gray-400 ml-1">{{ passwordStrength.label }}</p>
        </div>

        <!-- Confirm Password Field -->
        <label class="flex flex-col min-w-40 flex-1">
          <p class="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
            Confirmar contraseña
          </p>
          <div class="relative">
            <input
              v-model="passwordConfirm"
              required
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary dark:focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pr-12 text-base font-normal leading-normal"
              placeholder="Vuelve a escribir la contraseña"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              @click="showPasswordConfirm = !showPasswordConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              :disabled="isSubmitting"
            >
              <span class="material-symbols-outlined">
                {{ showPasswordConfirm ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
          <p
            v-if="passwordConfirm && !passwordsMatch"
            class="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            Las contraseñas no coinciden
          </p>
        </label>

        <!-- Terms and Conditions Checkbox -->
        <div class="flex items-center gap-2 mt-2">
          <input
            v-model="acceptTerms"
            id="terms"
            type="checkbox"
            required
            class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary bg-gray-100 dark:bg-gray-800"
            :disabled="isSubmitting"
          />
          <label class="text-sm text-gray-600 dark:text-gray-400" for="terms">
            Acepto los
            <a href="#" class="font-medium text-primary hover:underline"
              >términos y condiciones</a
            >
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="flex items-center justify-center w-full h-12 px-6 mt-4 text-base font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="!isSubmitting">Crear cuenta</span>
          <span v-else class="flex items-center gap-2">
            <span class="material-symbols-outlined animate-spin">sync</span>
            Creando cuenta...
          </span>
        </button>
      </form>

      <!-- Form Footer Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?
          <RouterLink to="/login" class="font-medium text-primary hover:underline"
            >Inicia sesión</RouterLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

