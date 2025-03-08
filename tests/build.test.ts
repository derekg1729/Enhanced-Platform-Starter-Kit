import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('Build Process', () => {
  it('should pass TypeScript compilation', () => {
    try {
      execSync('pnpm tsc --noEmit', { stdio: 'pipe' })
      expect(true).toBe(true) // If we get here, compilation passed
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      throw new Error(`TypeScript compilation failed: ${output}`)
    }
  })

  it('should pass ESLint checks', () => {
    try {
      execSync('pnpm eslint . --max-warnings 0', { stdio: 'pipe' })
      expect(true).toBe(true) // If we get here, linting passed
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      throw new Error(`ESLint checks failed: ${output}`)
    }
  })
}) 