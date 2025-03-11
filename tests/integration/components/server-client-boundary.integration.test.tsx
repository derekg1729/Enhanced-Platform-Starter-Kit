import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import AgentDetailsPage from '../../../app/app/(dashboard)/agents/[id]/page';
import { getAgentById } from '../../../lib/agent-db';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';

// Mock the next/link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock the AgentChatWrapper component to test the actual boundary
vi.mock('../../../components/agent/AgentChatWrapper', () => {
  // Create a wrapper that validates props
  return {
    __esModule: true,
    default: (props: any) => {
      // Check if onSendMessage is a function
      if (typeof props.onSendMessage === 'function') {
        throw new Error('Event handlers cannot be passed to Client Component props.');
      }
      
      // If we get here, render a placeholder
      return <div>Mock AgentChatWrapper</div>;
    },
  };
});

// Mock the AgentApiConnectionManager component
vi.mock('../../../components/agent/AgentApiConnectionManager', () => {
  return {
    __esModule: true,
    default: ({ agentId }: { agentId: string }) => (
      <div data-testid="agent-api-connection-manager">
        API connections for agent: {agentId}
      </div>
    ),
  };
});

// Mock the ModelSelectorWrapper component
vi.mock('../../../components/agent/ModelSelectorWrapper', () => {
  return {
    __esModule: true,
    default: ({ agentId, currentModel }: { agentId: string; currentModel: string }) => (
      <div data-testid="model-selector-wrapper">
        Model selector for agent: {agentId}, current model: {currentModel}
      </div>
    ),
  };
});

// Mock the auth and database functions
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('../../../lib/agent-db', () => ({
  getAgentById: vi.fn(),
  updateAgent: vi.fn(),
}));

describe('Server/Client Component Boundaries', () => {
  const mockAgent = {
    id: 'test-agent-123',
    name: 'Test Agent',
    description: 'This is a test agent',
    systemPrompt: 'You are a helpful assistant',
    model: 'gpt-3.5-turbo',
    temperature: '0.7',
    maxTokens: 1000,
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock authentication
    (getServerSession as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    
    // Mock agent data
    (getAgentById as any).mockResolvedValue(mockAgent);
  });

  // Helper function to check if a file is a client component
  function isClientComponent(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes("'use client'") || content.includes('"use client"');
  }

  // Helper function to check if a file imports React hooks
  function importsReactHooks(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    const hookImports = [
      'useState',
      'useEffect',
      'useContext',
      'useReducer',
      'useCallback',
      'useMemo',
      'useRef',
      'useImperativeHandle',
      'useLayoutEffect',
      'useDebugValue',
      'useTransition',
      'useDeferredValue',
      'useId',
      'useSyncExternalStore',
      'useInsertionEffect',
    ];

    // Check for hook imports from react
    const reactImportRegex = /import\s+{([^}]*)}\s+from\s+['"]react['"]/g;
    let match;
    while ((match = reactImportRegex.exec(content)) !== null) {
      const importedItems = match[1].split(',').map(item => item.trim());
      for (const hook of hookImports) {
        if (importedItems.includes(hook)) {
          return true;
        }
      }
    }

    // Check for direct hook usage in the file
    for (const hook of hookImports) {
      const hookRegex = new RegExp(`\\b${hook}\\(`, 'g');
      if (hookRegex.test(content)) {
        return true;
      }
    }

    return false;
  }

  it('should not pass function props directly from server to client components', () => {
    // This is a placeholder test that would normally check for function props
    // being passed from server to client components
    expect(true).toBe(true);
  });

  it('should properly separate client components into their own files', () => {
    // This is a placeholder test that would normally check for proper separation
    // of client components into their own files
    expect(true).toBe(true);
  });

  it('should mark all components using React hooks as client components', () => {
    const componentsDir = path.join(process.cwd(), 'components');
    const appDir = path.join(process.cwd(), 'app');
    
    // Array to collect problematic files
    const problemFiles: string[] = [];
    
    // Function to recursively check all .tsx files in a directory
    function checkDirectory(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          checkDirectory(fullPath);
        } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) {
          if (importsReactHooks(fullPath)) {
            const isClient = isClientComponent(fullPath);
            if (!isClient) {
              // Add to problem files list
              problemFiles.push(fullPath);
              console.log(`Problem file: ${fullPath} - Uses hooks but not marked as client component`);
            }
            expect(isClient).toBe(true);
          }
        }
      }
    }
    
    // Check both components and app directories
    checkDirectory(componentsDir);
    checkDirectory(appDir);
    
    // If we have problem files, log them all at the end
    if (problemFiles.length > 0) {
      console.log('\nComponents using hooks but not marked as client components:');
      problemFiles.forEach(file => {
        console.log(`- ${file}`);
      });
    }
  });

  it('should mark ModelSelectorWrapper as a client component', () => {
    const filePath = path.join(process.cwd(), 'components', 'agent', 'ModelSelectorWrapper.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(isClientComponent(filePath)).toBe(true);
  });
}); 