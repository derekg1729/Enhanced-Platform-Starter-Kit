/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/__helpers__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/__helpers__/setup.ts',
      ],
    },
    include: [
      './tests/**/*.{unit,integration,e2e,perf}.test.{js,ts,jsx,tsx}',
    ],
    testTimeout: 5000,
    retry: process.env.CI ? 2 : 0,
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
      ignoreSourceErrors: false,
      include: [
        'tests/**/*.test.{ts,tsx}'
      ],
      exclude: ['node_modules'],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
}) 