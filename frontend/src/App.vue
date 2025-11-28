<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const { loadTheme } = useTheme()

// Inicializar autenticación y tema al montar la aplicación
onMounted(() => {
  authStore.initializeAuth()
  loadTheme()
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
