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
  it('should include Google Analytics script in production build HTML', async () => {
    try {
      // Build the app (this will take some time)
      console.log('Building the app for production...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // Check if the build directory exists
      const buildDir = path.join(process.cwd(), '.next');
      expect(fs.existsSync(buildDir)).toBeTruthy();
      console.log(`Build directory exists at: ${buildDir}`);
      
      // Find HTML files in the build output
      const htmlFiles = findHtmlFiles(buildDir);
      console.log(`Found ${htmlFiles.length} HTML/JS files to check`);
      
      if (htmlFiles.length === 0) {
        console.log('No HTML files found in build output. This is unexpected.');
        // List directories to help debug
        console.log('Contents of .next directory:');
        listDirectoryContents(buildDir);
      } else {
        console.log('HTML/JS files found:');
        htmlFiles.forEach(file => console.log(` - ${file}`));
      }
      
      // Check if any HTML file contains the Google Analytics script
      let foundGoogleAnalytics = false;
      const gaMatches = [];
      
      for (const htmlFile of htmlFiles) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        
        // Check for various Google Analytics signatures
        const checks = {
          'googletagmanager.com': content.includes('googletagmanager.com'),
          'google-analytics.com': content.includes('google-analytics.com'),
          'gtag': content.includes('gtag'),
          'GA_ID': content.includes('G-NGR51LW106'),
          'GoogleAnalytics': content.includes('GoogleAnalytics'),
          '@next/third-parties/google': content.includes('@next/third-parties/google')
        };
        
        const hasMatch = Object.values(checks).some(Boolean);
        
        if (hasMatch) {
          foundGoogleAnalytics = true;
          gaMatches.push({
            file: htmlFile,
            matches: Object.entries(checks)
              .filter(([_, matched]) => matched)
              .map(([key]) => key)
          });
        }
      }
      
      if (gaMatches.length > 0) {
        console.log('Google Analytics references found in:');
        gaMatches.forEach(match => {
          console.log(` - ${match.file}`);
          console.log(`   Matches: ${match.matches.join(', ')}`);
        });
        
        // If we found GA references, the test should pass
        expect(foundGoogleAnalytics).toBeTruthy();
      } else {
        console.log('No Google Analytics references found in any files.');
        
        // Check if the GA ID is in the environment
        console.log('Checking environment variables:');
        console.log(`NEXT_PUBLIC_GA_ID in process.env: ${!!process.env.NEXT_PUBLIC_GA_ID}`);
        
        // Check if the layout file includes GA
        const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
        if (fs.existsSync(layoutPath)) {
          const layoutContent = fs.readFileSync(layoutPath, 'utf8');
          console.log(`Layout file includes GoogleAnalytics import: ${layoutContent.includes('GoogleAnalytics')}`);
          console.log(`Layout file includes GoogleAnalytics component: ${layoutContent.includes('<GoogleAnalytics')}`);
        }
        
        // If we didn't find GA references, the test should fail
        expect(foundGoogleAnalytics).toBeTruthy();
      }
    } catch (error) {
      console.error('Error during build test:', error);
      throw error;
    }
  }, 60000); // Increase timeout to 60 seconds
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
      // Also check JS files for inline HTML or GA references
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<!DOCTYPE html>') || 
          content.includes('<html') || 
          content.includes('googletagmanager.com') || 
          content.includes('google-analytics.com') || 
          content.includes('GoogleAnalytics') ||
          content.includes('G-NGR51LW106')) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Helper function to list directory contents
function listDirectoryContents(dir: string, indent = '') {
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      console.log(`${indent}📁 ${file}/`);
      // Only go one level deep to avoid too much output
      if (indent === '') {
        listDirectoryContents(filePath, `${indent}  `);
      }
    } else {
      console.log(`${indent}📄 ${file}`);
    }
  });
} 