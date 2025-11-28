import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/__tests__/',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.d.ts',
          'src/main.ts',
          'src/router/index.ts', // Router tiene lógica compleja que se testea en E2E
          // Archivos de configuración
          '*.config.{js,ts}',
          'eslint.config.ts',
          'postcss.config.js',
          'tailwind.config.js',
          'vite.config.ts',
          'vitest.config.ts',
          // Tipos (solo definiciones, no lógica)
          'src/types/**',
          // Vistas (se testean mejor con E2E)
          'src/views/**',
          // Stores de ejemplo
          'src/stores/counter.ts',
          // API (más fácil de testear con integración)
          'src/api/**',
        ],
        include: [
          'src/**/*.{ts,vue}',
        ],
        // Solo contar archivos que realmente importamos en src/
        all: false,
        // Límite mínimo de cobertura
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  }),
)
