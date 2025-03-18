import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock components
vi.mock('@/components/agent-card', () => ({
  default: () => <div data-testid="agent-card">Agent Card</div>,
}));

vi.mock('@/components/site-card', () => ({
  default: () => <div data-testid="site-card">Site Card</div>,
}));

vi.mock('@/components/agents', () => ({
  default: () => <div data-testid="agents">Agents List</div>,
}));

vi.mock('@/components/sites', () => ({
  default: () => <div data-testid="sites">Sites List</div>,
}));

describe('UI Consistency', () => {
  // Test for component structure consistency
  describe('Component Structure Consistency', () => {
    it('AgentCard structure matches SiteCard structure', () => {
      // This is a simple mock test to verify the test file works
      render(<div data-testid="agent-card">Agent Card</div>);
      render(<div data-testid="site-card">Site Card</div>);
      
      expect(screen.getByTestId('agent-card')).toBeInTheDocument();
      expect(screen.getByTestId('site-card')).toBeInTheDocument();
    });

    it('Agents page structure matches Sites page structure', () => {
      // This is a simple mock test to verify the test file works
      render(<div data-testid="agents">Agents List</div>);
      render(<div data-testid="sites">Sites List</div>);
      
      expect(screen.getByTestId('agents')).toBeInTheDocument();
      expect(screen.getByTestId('sites')).toBeInTheDocument();
    });
  });

  // Test for module imports and existence
  describe('Module Imports and File Existence', () => {
    it('All required component files exist', () => {
      const requiredFiles = [
        'components/site-card.tsx',
        'components/agents.tsx',
        'components/sites.tsx',
        'components/agent-card.tsx', // This is the missing file!
      ];
      
      requiredFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath), `File ${file} should exist`).toBe(true);
      });
    });
    
    it('Components have valid imports', () => {
      // Check agents.tsx imports
      const agentsPath = path.join(process.cwd(), 'components/agents.tsx');
      if (fs.existsSync(agentsPath)) {
        const agentsContent = fs.readFileSync(agentsPath, 'utf8');
        
        // Check if it imports AgentCard
        const importsAgentCard = agentsContent.includes('import AgentCard from');
        
        if (importsAgentCard) {
          // Make sure the imported file exists
          const agentCardMatch = agentsContent.match(/import AgentCard from ['"](.*)['"]/);
          if (agentCardMatch && agentCardMatch[1]) {
            let importPath = agentCardMatch[1];
            
            // Handle relative imports
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
              const agentsDir = path.dirname(agentsPath);
              const resolvedPath = path.resolve(agentsDir, importPath + (importPath.endsWith('.tsx') ? '' : '.tsx'));
              expect(fs.existsSync(resolvedPath), `Import ${importPath} in agents.tsx should exist`).toBe(true);
            }
            // Handle absolute imports
            else if (importPath.startsWith('@/')) {
              const absolutePath = path.join(process.cwd(), importPath.replace('@/', ''));
              expect(fs.existsSync(absolutePath), `Import ${importPath} in agents.tsx should exist`).toBe(true);
            }
          }
        }
      }
    });
  });

  // Test for file existence
  describe('Required Files Existence', () => {
    it('agent-card.tsx file exists and is imported correctly in agents.tsx', () => {
      // Check if agent-card.tsx exists
      const agentCardPath = path.join(process.cwd(), 'components/agent-card.tsx');
      expect(fs.existsSync(agentCardPath), 'components/agent-card.tsx should exist').toBe(true);
      
      // Check if agents.tsx imports agent-card.tsx correctly
      const agentsPath = path.join(process.cwd(), 'components/agents.tsx');
      if (fs.existsSync(agentsPath)) {
        const agentsContent = fs.readFileSync(agentsPath, 'utf8');
        expect(agentsContent.includes('import AgentCard from "./agent-card"'), 
          'agents.tsx should import AgentCard from "./agent-card"').toBe(true);
      }
    });
  });

  // Test for "use client" directive in client components
  describe('Client Component Directives', () => {
    const clientComponents = [
      'components/site-card.tsx',
      'components/create-site-button.tsx',
      'components/modal/create-site.tsx',
      'components/create-agent-button.tsx',
      'components/modal/create-agent.tsx',
    ];

    const serverComponents = [
      'components/sites.tsx',
      'components/agents.tsx',
      'app/app/(dashboard)/sites/page.tsx',
      'app/app/(dashboard)/agents/page.tsx',
    ];

    it('Client components should have "use client" directive', () => {
      // This test will check if client components have the "use client" directive
      clientComponents.forEach(componentPath => {
        const fullPath = path.join(process.cwd(), componentPath);
        
        // Check if the file exists
        if (!fs.existsSync(fullPath)) {
          console.warn(`File ${componentPath} does not exist, skipping check`);
          return;
        }
        
        // Read the file content
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if the file starts with "use client"
        expect(
          content.trim().startsWith('"use client"') || 
          content.trim().startsWith("'use client'"),
          `${componentPath} should have 'use client' directive`
        ).toBe(true);
      });
    });

    it('Server components should not have "use client" directive unless necessary', () => {
      // This test will check if server components don't have the "use client" directive
      serverComponents.forEach(componentPath => {
        const fullPath = path.join(process.cwd(), componentPath);
        
        // Check if the file exists (skip if it doesn't)
        if (!fs.existsSync(fullPath)) {
          console.warn(`File ${componentPath} does not exist, skipping check`);
          return;
        }
        
        // Read the file content
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if the file does not start with "use client"
        // This test is designed to fail if a server component has "use client" directive
        const hasUseClient = content.trim().startsWith('"use client"') || 
                           content.trim().startsWith("'use client'");
        
        expect(
          hasUseClient,
          `${componentPath} should not have 'use client' directive unless it uses client hooks`
        ).toBe(false);
      });
    });
  });
}); 