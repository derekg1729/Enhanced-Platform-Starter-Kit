import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'

describe('Build Prerequisites', () => {
  it('should have all required config files', () => {
    const requiredFiles = [
      'next.config.js',
      'drizzle.config.ts',
      'tsconfig.json',
      '.env.example'
    ]
    
    requiredFiles.forEach(file => {
      expect(fs.existsSync(file), `Missing ${file}`).toBe(true)
    })
  })

  it('should have valid package.json with required scripts', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.scripts.build).toBeDefined()
    expect(pkg.scripts.dev).toBeDefined()
    expect(pkg.scripts.start).toBeDefined()
  })

  it('should have package.json in sync with pnpm-lock.yaml', () => {
    try {
      execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' })
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      throw new Error(`Dependencies are out of sync: ${output}`)
    }
  })

  it('should pass TypeScript compilation', () => {
    try {
      execSync('pnpm tsc --noEmit', { stdio: 'pipe' })
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      throw new Error(`TypeScript compilation failed: ${output}`)
    }
  })

  it('should pass ESLint checks', () => {
    try {
      execSync('pnpm eslint . --max-warnings 0', { stdio: 'pipe' })
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      throw new Error(`ESLint checks failed: ${output}`)
    }
  })

  it('should have all required environment variables in .env.example', () => {
    const envExample = fs.readFileSync('.env.example', 'utf8')
    const requiredVars = [
      'AUTH_GITHUB_ID',
      'AUTH_GITHUB_SECRET',
      'POSTGRES_URL',
      'NEXT_PUBLIC_ROOT_DOMAIN',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ]

    requiredVars.forEach(variable => {
      expect(envExample).toContain(variable)
    })
  })
}) 