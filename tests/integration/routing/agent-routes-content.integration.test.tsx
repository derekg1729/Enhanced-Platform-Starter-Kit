import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Agent Routes Content', () => {
  // Read file content
  const readFileContent = (filePath: string): string => {
    try {
      return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    } catch (error) {
      return '';
    }
  };

  it('should have proper content in agent pages', () => {
    // Read the content of the dashboard pages
    const dashboardMainPage = readFileContent('app/app/(dashboard)/agents/page.tsx');
    const dashboardDetailsPage = readFileContent('app/app/(dashboard)/agents/[id]/page.tsx');
    const dashboardNewPage = readFileContent('app/app/(dashboard)/agents/new/page.tsx');
    
    // Check if the content contains the expected components
    expect(dashboardMainPage).not.toBe('');
    expect(dashboardMainPage.includes('AgentsPageClient')).toBe(true);
    
    expect(dashboardDetailsPage).not.toBe('');
    expect(dashboardDetailsPage.includes('Agent Details')).toBe(true);
    
    expect(dashboardNewPage).not.toBe('');
    expect(dashboardNewPage.includes('Create New Agent')).toBe(true);
  });
}); 