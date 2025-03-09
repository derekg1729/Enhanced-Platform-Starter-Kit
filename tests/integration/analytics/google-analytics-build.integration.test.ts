import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Google Analytics Build Integration', () => {
  // This test is more intensive as it requires building the app
  // Skip in CI environments unless explicitly enabled
  const shouldRunBuildTests = process.env.RUN_BUILD_TESTS === 'true';
  
  if (!shouldRunBuildTests) {
    it.skip('should include Google Analytics in production build (skipped - set RUN_BUILD_TESTS=true to run)', () => {
      // This test is skipped by default
    });
    return;
  }

  // Only run these tests if explicitly enabled
  it('should include Google Analytics script in production build HTML', () => {
    try {
      // Build the app (this will take some time)
      console.log('Building the app for production...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // Check if the build directory exists
      const buildDir = path.join(process.cwd(), '.next');
      expect(fs.existsSync(buildDir)).toBeTruthy();
      
      // Find HTML files in the build output
      const htmlFiles = findHtmlFiles(buildDir);
      expect(htmlFiles.length).toBeGreaterThan(0);
      
      // Check if any HTML file contains the Google Analytics script
      let foundGoogleAnalytics = false;
      for (const htmlFile of htmlFiles) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        if (content.includes('googletagmanager.com') || 
            content.includes('google-analytics.com') || 
            content.includes('gtag') || 
            content.includes('G-NGR51LW106')) {
          foundGoogleAnalytics = true;
          break;
        }
      }
      
      expect(foundGoogleAnalytics).toBeTruthy();
    } catch (error) {
      console.error('Error during build test:', error);
      throw error;
    }
  });
});

// Helper function to recursively find HTML files
function findHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      results.push(...findHtmlFiles(filePath));
    } else if (file.endsWith('.html') || file.endsWith('.htm')) {
      // Add HTML files to results
      results.push(filePath);
    } else if (file.endsWith('.js')) {
      // Also check JS files for inline HTML
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        results.push(filePath);
      }
    }
  });
  
  return results;
} 