import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AgentCard and SiteCard Consistency', () => {
  const agentCardPath = path.join(process.cwd(), 'components/agent-card.tsx');
  const siteCardPath = path.join(process.cwd(), 'components/site-card.tsx');

  it('verifies both components have use client directive', () => {
    // Read the source files
    const agentCardContent = fs.readFileSync(agentCardPath, 'utf8');
    const siteCardContent = fs.readFileSync(siteCardPath, 'utf8');
    
    // Check that both start with use client directive
    expect(agentCardContent.trim().startsWith('"use client"')).toBe(true);
    expect(siteCardContent.trim().startsWith('"use client"')).toBe(true);
  });
  
  it('ensures both components have similar import structure', () => {
    // Read the source files
    const agentCardContent = fs.readFileSync(agentCardPath, 'utf8');
    const siteCardContent = fs.readFileSync(siteCardPath, 'utf8');
    
    // Check imports
    const agentImports = agentCardContent.match(/^import .* from .*$/gm) || [];
    const siteImports = siteCardContent.match(/^import .* from .*$/gm) || [];
    
    // Both should import BlurImage
    expect(agentImports.some(i => i.includes('BlurImage'))).toBe(true);
    expect(siteImports.some(i => i.includes('BlurImage'))).toBe(true);
    
    // Both should import Link
    expect(agentImports.some(i => i.includes('Link'))).toBe(true);
    expect(siteImports.some(i => i.includes('Link'))).toBe(true);
  });
  
  it('ensures both components have similar props structure', () => {
    // Read the source files
    const agentCardContent = fs.readFileSync(agentCardPath, 'utf8');
    const siteCardContent = fs.readFileSync(siteCardPath, 'utf8');
    
    // Extract props definition
    const agentProps = agentCardContent.match(/function AgentCard\(\{ ([^}]*) \}/);
    const siteProps = siteCardContent.match(/function SiteCard\(\{ ([^}]*) \}/);
    
    // Both should take data prop
    expect(agentProps && agentProps[1].includes('data')).toBe(true);
    expect(siteProps && siteProps[1].includes('data')).toBe(true);
  });
  
  it('ensures both components have consistent styling', () => {
    // Extract all className attributes
    const agentCardContent = fs.readFileSync(agentCardPath, 'utf8');
    const siteCardContent = fs.readFileSync(siteCardPath, 'utf8');
    
    const agentClasses = agentCardContent.match(/className="[^"]+"/g) || [];
    const siteClasses = siteCardContent.match(/className="[^"]+"/g) || [];
    
    // Both should have similar number of className attributes
    const classDiff = Math.abs(agentClasses.length - siteClasses.length);
    expect(classDiff).toBeLessThanOrEqual(4); // Allow small differences
    
    // Check for common style patterns
    const commonStyles = ['rounded-lg', 'border', 'shadow-md', 'hover:shadow-xl', 'dark:border-stone-700'];
    
    for (const style of commonStyles) {
      expect(agentCardContent.includes(style)).toBe(true);
      expect(siteCardContent.includes(style)).toBe(true);
    }
  });
}); 