import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// List of critical dependencies our app needs
const CRITICAL_DEPENDENCIES = [
  'class-variance-authority',
  '@radix-ui/react-dialog',
  'react-hook-form',
  '@hookform/resolvers',
  'zod',
  'glob',
];

// List of type definitions we need
const REQUIRED_TYPE_DEFINITIONS = [
  '@types/pg',
  '@types/react',
  '@types/node',
];

describe('Dependency Check', () => {
  let packageJson: { dependencies: Record<string, string>, devDependencies: Record<string, string> };

  beforeEach(() => {
    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
  });

  it('should have all critical dependencies installed', () => {
    const installedDependencies = { 
      ...packageJson.dependencies, 
      ...packageJson.devDependencies 
    };

    for (const dep of CRITICAL_DEPENDENCIES) {
      expect(installedDependencies[dep]).toBeDefined();
      
      // Also check if the dependency exists in node_modules
      const depPath = path.join(process.cwd(), 'node_modules', dep);
      expect(existsSync(depPath)).toBe(true);
    }
  });

  it('should have all required type definitions', () => {
    const installedDependencies = { 
      ...packageJson.dependencies, 
      ...packageJson.devDependencies 
    };

    for (const typeDef of REQUIRED_TYPE_DEFINITIONS) {
      expect(installedDependencies[typeDef]).toBeDefined();
      
      // Also check if the type definition exists in node_modules
      const typeDefPath = path.join(process.cwd(), 'node_modules', typeDef);
      expect(existsSync(typeDefPath)).toBe(true);
    }
  });

  it('should have all standard npm dependencies resolvable', () => {
    // Create a simple test for common import paths (excluding project-specific paths)
    const importPaths = [
      'class-variance-authority',
      '@radix-ui/react-dialog',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'glob',
    ];

    for (const importPath of importPaths) {
      try {
        // This will throw if the module can't be resolved
        require.resolve(importPath, { paths: [process.cwd()] });
        expect(true).toBe(true);
      } catch (error) {
        // If this errors, the module can't be resolved
        console.error(`Import path '${importPath}' cannot be resolved:`, error);
        expect(`Import path '${importPath}' can be resolved`).toBe(true);
      }
    }
  });
}); 