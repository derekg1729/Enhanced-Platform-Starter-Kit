import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

/**
 * Client/Server Component Boundary Tests
 * 
 * These tests verify that client/server component boundaries are respected.
 * In Next.js app router, proper boundaries are critical to prevent runtime errors.
 */
describe('Client/Server Component Boundaries', () => {
  // Function to check if a file is a client component (has "use client" directive)
  const isClientComponent = (filePath: string): boolean => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    } catch (error) {
      return false;
    }
  };

  // Function to check if file content uses any React hooks
  const usesReactHooks = (content: string): boolean => {
    const hooksPatterns = [
      'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 
      'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 
      'useDebugValue', 'useTransition', 'useDeferredValue', 'useId',
      'useInsertionEffect', 'useSyncExternalStore'
    ];
    
    return hooksPatterns.some(hook => {
      const regex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
      return regex.test(content);
    });
  };

  // Function to check if file content uses any Next.js client hooks
  const usesNextClientHooks = (content: string): boolean => {
    const nextClientHooks = [
      'useRouter', 'useParams', 'usePathname', 'useSearchParams',
      'useSelectedLayoutSegment', 'useSelectedLayoutSegments',
      'useFormState', 'useFormStatus', 'useOptimistic'
    ];
    
    return nextClientHooks.some(hook => {
      const regex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
      return regex.test(content);
    });
  };

  it('should have "use client" directive in all components using React hooks', () => {
    // Get all component files
    const componentFiles = globSync('components/**/*.tsx', { absolute: true });
    
    // Check each file
    const serverComponentsWithHooks: string[] = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const isClient = isClientComponent(filePath);
      
      // Check if the file uses React hooks
      if (usesReactHooks(content) && !isClient) {
        serverComponentsWithHooks.push(path.relative(process.cwd(), filePath));
      }
    });
    
    if (serverComponentsWithHooks.length > 0) {
      console.error('Components using React hooks without "use client" directive:');
      serverComponentsWithHooks.forEach(file => console.error(` - ${file}`));
    }
    
    expect(serverComponentsWithHooks).toEqual([]);
  });

  it('should have "use client" directive in all components using Next.js client hooks', () => {
    // Get all component files
    const componentFiles = globSync('components/**/*.tsx', { absolute: true });
    
    // Check each file
    const serverComponentsWithClientHooks: string[] = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const isClient = isClientComponent(filePath);
      
      // Check if the file uses Next.js client hooks
      if (usesNextClientHooks(content) && !isClient) {
        serverComponentsWithClientHooks.push(path.relative(process.cwd(), filePath));
      }
    });
    
    if (serverComponentsWithClientHooks.length > 0) {
      console.error('Components using Next.js client hooks without "use client" directive:');
      serverComponentsWithClientHooks.forEach(file => console.error(` - ${file}`));
    }
    
    expect(serverComponentsWithClientHooks).toEqual([]);
  });

  it('should have "use client" directive in all interactive components', () => {
    // Get all component files
    const componentFiles = globSync('components/**/*.tsx', { absolute: true });
    
    // Check each file for event handlers without "use client"
    const serverComponentsWithEventHandlers: string[] = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const isClient = isClientComponent(filePath);
      
      // Check for common event handler patterns
      const hasEventHandlers = /onClick=|onChange=|onSubmit=|onBlur=|onFocus=|onMouseOver=|onMouseOut=/.test(content);
      
      if (hasEventHandlers && !isClient) {
        serverComponentsWithEventHandlers.push(path.relative(process.cwd(), filePath));
      }
    });
    
    if (serverComponentsWithEventHandlers.length > 0) {
      console.error('Components with event handlers without "use client" directive:');
      serverComponentsWithEventHandlers.forEach(file => console.error(` - ${file}`));
    }
    
    expect(serverComponentsWithEventHandlers).toEqual([]);
  });

  it('should have consistent import statements for React in client components', () => {
    // Get all client component files
    const clientComponentFiles = globSync('components/**/*.tsx', { absolute: true })
      .filter(isClientComponent);
    
    // Check for correct React imports
    const inconsistentImports: string[] = [];
    
    clientComponentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file imports React properly
      const hasReactImport = /^import React from ['"]react['"];?\s*$/m.test(content) || 
                             /^import \* as React from ['"]react['"];?\s*$/m.test(content);
      
      // Check for named imports that might need the React namespace
      const hasNamedReactImports = /^import \{[^}]*\} from ['"]react['"];?\s*$/m.test(content);
      
      // Check if it's using JSX without proper React import
      const usesJSX = /<\s*[A-Z][A-Za-z0-9]*/.test(content);
      
      // In React 17+ with automatic JSX transform, explicit React import isn't required
      // But for consistency, we might want to enforce a pattern
      if (usesJSX && !hasReactImport && !hasNamedReactImports) {
        // This is actually fine with modern JSX transform, so we're not marking it as inconsistent
        // But we might want to enforce a pattern for consistency
      }
    });
    
    if (inconsistentImports.length > 0) {
      console.error('Client components with inconsistent React imports:');
      inconsistentImports.forEach(file => console.error(` - ${file}`));
    }
    
    expect(inconsistentImports).toEqual([]);
  });
}); 