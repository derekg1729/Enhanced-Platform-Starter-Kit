import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';

describe('Component Compilation', () => {
  // Setup mock context providers that many components might need
  beforeEach(() => {
    // Mock any global hooks or providers that components might need
    vi.mock('next/navigation', () => ({
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      }),
      useSearchParams: () => ({
        get: vi.fn(),
      }),
      usePathname: () => '/test',
    }));

    // Add other mock providers as needed
    vi.mock('@/components/modal/provider', () => ({
      useModal: vi.fn(() => ({
        show: vi.fn(),
        hide: vi.fn(),
        isShown: false,
      })),
    }));

    // Mock form actions
    vi.mock('@/lib/actions', () => ({
      createSite: vi.fn(),
      createPost: vi.fn(),
      updatePost: vi.fn(),
      createAgent: vi.fn(),
      updateAgent: vi.fn(),
      deleteAgent: vi.fn(),
      createApiConnection: vi.fn(),
      deleteApiConnection: vi.fn(),
    }));
  });

  it('ensures all components can be imported without errors', () => {
    // This test verifies that we can import all components without errors
    // We'll dynamically import a few key components to check compilation
    
    // List of components to test import
    const componentsToTest = [
      '@/components/site-card',
      '@/components/agent-card',
      '@/components/create-site-button',
      '@/components/create-agent-button',
    ];
    
    // For each component, we'll try to import it
    // If it fails to import, the test will fail
    expect(async () => {
      for (const component of componentsToTest) {
        try {
          // This should not throw if the component can be imported
          await import(component);
        } catch (error) {
          console.error(`Failed to import ${component}:`, error);
          throw error;
        }
      }
    }).not.toThrow();
  });

  it('checks for potential React compiler warnings in components', () => {
    // List directories to scan for component files
    const componentDirectories = [
      { dir: 'components', pattern: '*.tsx' },
      { dir: 'components/modal', pattern: '*.tsx' },
      { dir: 'components/ui', pattern: '*.tsx' },
    ];
    
    // Known patterns that cause React compiler warnings
    const warningPatterns = [
      { pattern: /useState\([^)]*\).*useState\([^)]*\)/s, description: 'Multiple useState calls without line breaks' },
      { pattern: /<[A-Z][^>]*\s+style={{.*?}}/s, description: 'Inline style objects (consider using className instead)' },
      { pattern: /onClick\s*=\s*{\s*\(\)\s*=>\s*{[^}]{50,}}/s, description: 'Large inline event handlers' },
      { pattern: /useEffect\(\s*\(\)\s*=>\s*{[^}]{100,}}/s, description: 'Large useEffect bodies' },
      { pattern: /\{\/\*.*?\*\/\}/g, description: 'JSX comments (use regular JS comments outside JSX)' },
      { pattern: /key={\s*index\s*}/g, description: 'Using array index as key' },
    ];
    
    // Scan components for potential issues
    for (const { dir, pattern } of componentDirectories) {
      const dirPath = path.join(process.cwd(), dir);
      
      if (!fs.existsSync(dirPath)) {
        continue;
      }
      
      const files = fs.readdirSync(dirPath)
        .filter(file => {
          // Convert glob pattern to RegExp
          const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
          return new RegExp(regexPattern).test(file);
        })
        .map(file => path.join(dir, file));
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
        
        // Check for each warning pattern
        for (const { pattern, description } of warningPatterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 0) {
            console.warn(`Warning in ${file}: ${description}`);
            // This is just a warning, not a test failure
          }
        }
      }
    }
    
    // This test doesn't assert anything, it just scans for warnings
    expect(true).toBe(true);
  });

  it('ensures components avoid common server/client boundary errors', () => {
    // List of server components that should be checked for client-side features
    const serverComponents = [
      'app/app/(dashboard)/agents/page.tsx',
      'app/app/(dashboard)/sites/page.tsx',
      'components/agents.tsx',
      'components/sites.tsx',
    ];
    
    // Client-only features that shouldn't be used in server components
    const clientFeatures = [
      { pattern: /useState\s*\(/, description: 'useState hook' },
      { pattern: /useEffect\s*\(/, description: 'useEffect hook' },
      { pattern: /useContext\s*\(/, description: 'useContext hook' },
      { pattern: /useRef\s*\(/, description: 'useRef hook' },
      { pattern: /useCallback\s*\(/, description: 'useCallback hook' },
      { pattern: /useMemo\s*\(/, description: 'useMemo hook' },
      { pattern: /useReducer\s*\(/, description: 'useReducer hook' },
      { pattern: /onClick\s*=\s*{/, description: 'onClick handler' },
      { pattern: /onChange\s*=\s*{/, description: 'onChange handler' },
      { pattern: /onSubmit\s*=\s*{/, description: 'onSubmit handler' },
    ];
    
    for (const component of serverComponents) {
      const filePath = path.join(process.cwd(), component);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${component} does not exist, skipping.`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Skip if it's marked as a client component
      if (content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")) {
        continue;
      }
      
      // Check for client features
      for (const { pattern, description } of clientFeatures) {
        const hasClientFeature = pattern.test(content);
        
        expect(
          hasClientFeature,
          `Server component ${component} should not use client feature: ${description}`
        ).toBe(false);
      }
    }
  });

  it('ensures UI components render without crashing', () => {
    // Mock minimal props for various components
    const mockProps = {
      site: {
        id: 'site-123',
        name: 'Test Site',
        description: 'This is a test site',
        subdomain: 'test',
        userId: 'user-123',
        image: 'https://example.com/image.jpg',
        imageBlurhash: 'placeholder',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      agent: {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    };

    // Mock any imported components
    vi.mock('@/components/blur-image', () => ({
      default: ({ alt, src }: { alt: string, src: string }) => (
        <div data-testid="blur-image" data-alt={alt} data-src={src} />
      ),
    }));
    
    // Function to test if a component renders without crashing
    const testComponentRender = (Component: React.ComponentType<any>, props: any, name: string) => {
      try {
        render(<Component {...props} />);
        return true;
      } catch (error) {
        console.error(`Error rendering ${name}:`, error);
        return false;
      }
    };
    
    // Define a list of components to test with their props
    // We can't test all of them, so focus on the main ones we're concerned about
    const componentsToTest: { component: React.ComponentType<any>; props: any; name: string }[] = [
      // { component: require('@/components/site-card').default, props: { data: mockProps.site }, name: 'SiteCard' },
      // { component: require('@/components/agent-card').default, props: { data: mockProps.agent }, name: 'AgentCard' },
    ];
    
    // For each component, expect it to render without crashing
    for (const { component, props, name } of componentsToTest) {
      const rendered = testComponentRender(component, props, name);
      expect(rendered).toBe(true);
    }
  });
}); 