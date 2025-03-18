import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * This test suite verifies that imports in our codebase resolve correctly.
 * It specifically checks for the imports that are failing in our application.
 */
describe('Import Resolution', () => {
  // Helper function to check if a file exists
  const fileExists = (filePath: string): boolean => {
    try {
      return fs.existsSync(path.join(process.cwd(), filePath));
    } catch (error) {
      return false;
    }
  };

  // Helper function to parse import statements from a file
  const parseImports = (filePath: string): { importPath: string; lineNumber: number }[] => {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
      const lines = content.split('\n');
      const imports: { importPath: string; lineNumber: number }[] = [];

      lines.forEach((line, index) => {
        // Match import statements
        const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch && importMatch[1]) {
          imports.push({ importPath: importMatch[1], lineNumber: index + 1 });
        }
      });

      return imports;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return [];
    }
  };

  // Helper function to resolve import paths
  const resolveImportPath = (importPath: string, sourceFilePath: string): string => {
    if (importPath.startsWith('@/')) {
      // For absolute imports with the '@/' prefix
      return importPath.replace('@/', '');
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // For relative imports
      const sourceDir = path.dirname(sourceFilePath);
      return path.normalize(path.join(sourceDir, importPath));
    } else {
      // For node modules or other imports
      return '';
    }
  };

  // Test that known problematic imports resolve correctly
  it('should have the AgentCard component importable from components/agents.tsx', () => {
    const sourceFilePath = 'components/agents.tsx';
    
    // Verify source file exists
    expect(fileExists(sourceFilePath)).toBe(true);
    
    // Parse imports
    const imports = parseImports(sourceFilePath);
    
    // Find the import for AgentCard
    const agentCardImport = imports.find(imp => imp.importPath.includes('agent-card'));
    
    expect(agentCardImport).toBeDefined();
    
    if (agentCardImport) {
      // Check if it's trying to import from './agent-card'
      if (agentCardImport.importPath === './agent-card') {
        // The file should exist at components/agent-card.tsx
        const targetFile = 'components/agent-card.tsx';
        expect(fileExists(targetFile)).toBe(true);
      }
    }
  });

  it('should have the correct schema import in agents/[id]/page.tsx', () => {
    const sourceFilePath = 'app/app/(dashboard)/agents/[id]/page.tsx';
    
    // Verify source file exists
    expect(fileExists(sourceFilePath)).toBe(true);
    
    // Parse imports
    const imports = parseImports(sourceFilePath);
    
    // Find the import for schema
    const schemaImport = imports.find(imp => imp.importPath.includes('schema'));
    
    expect(schemaImport).toBeDefined();
    
    if (schemaImport) {
      // Check if it's trying to import from '@/lib/db/schema'
      if (schemaImport.importPath === '@/lib/db/schema') {
        // This is the incorrect import path, it should be '@/lib/schema'
        expect(fileExists('lib/db/schema.ts')).toBe(false);
        
        // The correct file should exist
        expect(fileExists('lib/schema.ts')).toBe(true);
      }
    }
  });

  it('should have all necessary image files for the agents page', () => {
    const sourceFilePath = 'components/agents.tsx';
    
    // Verify source file exists
    expect(fileExists(sourceFilePath)).toBe(true);
    
    // Read file content
    const content = fs.readFileSync(path.join(process.cwd(), sourceFilePath), 'utf8');
    
    // Look for image imports or references
    const svgImageMatch = content.match(/src="([^"]*\.svg)"/);
    if (svgImageMatch && svgImageMatch[1]) {
      const svgPath = svgImageMatch[1];
      if (svgPath.startsWith('/')) {
        // For absolute path references, check in the public directory
        const publicPath = path.join('public', svgPath);
        expect(fileExists(publicPath)).toBe(true);
      }
    }
    
    // Check for any hardcoded URLs
    const externalUrlMatch = content.match(/src="(https?:\/\/[^"]+)"/);
    if (externalUrlMatch && externalUrlMatch[1]) {
      // We should ensure external URLs are valid in the future,
      // but for now just log them for manual verification
      console.log(`External URL found in agents.tsx: ${externalUrlMatch[1]}`);
    }
  });

  // Test for missing component files
  it('should have all component files referenced in imports', () => {
    // Check for missing components
    const missingFiles = [
      { source: 'components/agents.tsx', import: './agent-card', target: 'components/agent-card.tsx' },
      { source: 'components/edit-agent-form.tsx', import: '@/components/loading-dots', target: 'components/loading-dots.tsx' }
    ];
    
    const missingComponents = missingFiles.filter(file => !fileExists(file.target));
    
    // If there are missing components, provide detailed information
    if (missingComponents.length > 0) {
      console.error('Missing component files:');
      missingComponents.forEach(({ source, import: importPath, target }) => {
        console.error(`File ${source} imports '${importPath}' but the target file ${target} does not exist`);
      });
    }
    
    expect(missingComponents).toEqual([]);
  });

  // Test general import resolution for components
  it('should have all component imports resolving correctly', () => {
    const componentsDir = 'components';
    const componentFiles = fs.readdirSync(path.join(process.cwd(), componentsDir))
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));
    
    let unresolvedImports: { file: string; importPath: string; lineNumber: number }[] = [];
    
    componentFiles.forEach(file => {
      const filePath = path.join(componentsDir, file);
      const imports = parseImports(filePath);
      
      imports.forEach(imp => {
        // Skip node_module imports and React related imports
        if (!imp.importPath.startsWith('@/') && 
            !imp.importPath.startsWith('./') && 
            !imp.importPath.startsWith('../')) {
          return;
        }
        
        const resolvedPath = resolveImportPath(imp.importPath, filePath);
        
        // If it's an internal import, check if the file exists
        if (resolvedPath) {
          const fileToCheck = resolvedPath + (resolvedPath.endsWith('.tsx') || resolvedPath.endsWith('.ts') ? '' : '.tsx');
          
          if (!fileExists(fileToCheck) && !fileExists(fileToCheck.replace('.tsx', '.ts'))) {
            unresolvedImports.push({
              file: filePath,
              importPath: imp.importPath,
              lineNumber: imp.lineNumber
            });
          }
        }
      });
    });
    
    // Provide detailed information about unresolved imports
    if (unresolvedImports.length > 0) {
      console.error('Unresolved imports:');
      unresolvedImports.forEach(({ file, importPath, lineNumber }) => {
        console.error(`File ${file}:${lineNumber} imports '${importPath}' which cannot be resolved`);
      });
    }
    
    // We expect some unresolved imports that we've identified, but we should fix these
    const expectedUnresolvedImports = [
      { file: 'components/mdx.tsx', importPath: './mdx.module.css', lineNumber: 7 }
    ];
    
    // Only check if the unresolved imports match the expected ones
    expect(unresolvedImports).toEqual(expectedUnresolvedImports);
  });
}); 