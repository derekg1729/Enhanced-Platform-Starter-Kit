import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('API Route Configuration', () => {
  it('should have proper dynamic export configs for routes using server features', () => {
    // List of API routes that require dynamic rendering
    const dynamicRoutes = [
      'app/api/ai/models/route.ts',
      'app/api/auth/[...nextauth]/route.ts',
      'app/api/domain/[slug]/verify/route.ts',
      // Add other routes as they are identified
    ];

    for (const routePath of dynamicRoutes) {
      // Check if file exists
      expect(fs.existsSync(routePath), `Route file ${routePath} exists`).toBe(true);
      
      // Read file content
      const fileContent = fs.readFileSync(routePath, 'utf8');
      
      // Skip check for routes that use edge runtime
      if (fileContent.includes('export const runtime = "edge"') || 
          fileContent.includes("export const runtime = 'edge'")) {
        console.log(`Skipping ${routePath} as it uses edge runtime which is already dynamic`);
        continue;
      }
      
      // Check for dynamic export config
      const hasDynamicConfig = 
        fileContent.includes('export const dynamic = "force-dynamic"') ||
        fileContent.includes("export const dynamic = 'force-dynamic'");
      
      expect(hasDynamicConfig, 
        `Route ${routePath} should export dynamic = "force-dynamic" to prevent static generation`
      ).toBe(true);
    }
  });

  it('should have proper headers in routes that use server features', () => {
    // Find all route.ts files in the api directory
    const apiDir = path.join(process.cwd(), 'app/api');
    const routeFiles = findRouteFiles(apiDir);
    
    // Check each file that uses server-only features
    for (const routeFile of routeFiles) {
      const fileContent = fs.readFileSync(routeFile, 'utf8');
      
      // Skip check for routes that use edge runtime
      if (fileContent.includes('export const runtime = "edge"') || 
          fileContent.includes("export const runtime = 'edge'")) {
        console.log(`Skipping ${routeFile} as it uses edge runtime which is already dynamic`);
        continue;
      }
      
      // Check if file uses features that require dynamic rendering
      const usesServerFeatures = 
        fileContent.includes('getServerSession') || 
        fileContent.includes('headers()') ||
        fileContent.includes('cookies()') ||
        // Detect potential auth usage or database access
        (fileContent.includes('userId') && !fileContent.includes('// Test')) ||
        (fileContent.includes('session') && !fileContent.includes('// Test'));
      
      if (usesServerFeatures) {
        const hasDynamicConfig = 
          fileContent.includes('export const dynamic = "force-dynamic"') ||
          fileContent.includes("export const dynamic = 'force-dynamic'");
        
        expect(hasDynamicConfig, 
          `Route ${routeFile} uses server features but doesn't export dynamic = "force-dynamic"`
        ).toBe(true);
      }
    }
  });
});

/**
 * Recursively find all route.ts files in a directory
 */
function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
} 