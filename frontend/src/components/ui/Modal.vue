<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  showCloseButton?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
})

const emit = defineEmits<Emits>()

/**
 * Maneja el cierre con la tecla Escape
 */
function handleEsc(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

/**
 * Maneja el click en el backdrop para cerrar
 */
function handleBackdropClick(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target.classList.contains('modal-backdrop')) {
    emit('close')
  }
}

// Observar cambios en isOpen para bloquear/desbloquear scroll
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    } else {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  },
  { immediate: true }
)

// Limpiar listeners al desmontar
onUnmounted(() => {
  document.body.style.overflow = 'unset'
  window.removeEventListener('keydown', handleEsc)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="relative z-[60]">
      <!-- Backdrop -->
      <div
        class="modal-backdrop fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Container -->
      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          class="pointer-events-auto w-full max-w-lg transform rounded-xl bg-white dark:bg-background-dark shadow-2xl transition-all"
        >
          <!-- Header -->
          <div
            v-if="title || showCloseButton"
            class="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 p-4"
          >
            <h2 v-if="title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </h2>
            <button
              v-if="showCloseButton"
              @click="$emit('close')"
              class="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              type="button"
            >
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- Content -->
          <div class="p-0">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

