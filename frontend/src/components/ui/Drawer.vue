<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

interface Props {
  isOpen: boolean
  title: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
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
  if (target.classList.contains('drawer-backdrop')) {
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
    <div v-if="isOpen" class="relative z-50">
      <!-- Backdrop -->
      <div
        class="drawer-backdrop fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Drawer Panel -->
      <div
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white dark:bg-background-dark shadow-2xl transform transition-transform duration-300"
        :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <!-- Header -->
        <header
          class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6"
        >
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200">{{ title }}</h3>
          <button
            @click="$emit('close')"
            class="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            type="button"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <!-- Content (scrollable) -->
        <main class="flex-1 overflow-y-auto">
          <slot></slot>
        </main>
      </div>
    </div>
  </Teleport>
</template>

