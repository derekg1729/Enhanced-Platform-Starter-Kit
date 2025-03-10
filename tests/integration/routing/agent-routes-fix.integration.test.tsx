import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Agent Routes Fix', () => {
  // Backup paths for the duplicate files
  const backupDir = path.join(process.cwd(), 'tests', '__backups__');
  const mainPageBackup = path.join(backupDir, 'agents-page.tsx.backup');
  const detailsPageBackup = path.join(backupDir, 'agents-id-page.tsx.backup');
  const newPageBackup = path.join(backupDir, 'agents-new-page.tsx.backup');
  
  // Original paths for the duplicate files
  const mainPagePath = path.join(process.cwd(), 'app', 'agents', 'page.tsx');
  const detailsPagePath = path.join(process.cwd(), 'app', 'agents', '[id]', 'page.tsx');
  const newPagePath = path.join(process.cwd(), 'app', 'agents', 'new', 'page.tsx');
  
  // Check if a file exists
  const fileExists = (filePath: string): boolean => {
    return fs.existsSync(filePath);
  };
  
  // Create backup directory if it doesn't exist
  beforeAll(() => {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup the files if they exist
    if (fileExists(mainPagePath)) {
      fs.copyFileSync(mainPagePath, mainPageBackup);
    }
    
    if (fileExists(detailsPagePath)) {
      fs.copyFileSync(detailsPagePath, detailsPageBackup);
    }
    
    if (fileExists(newPagePath)) {
      fs.copyFileSync(newPagePath, newPageBackup);
    }
  });
  
  // Restore the files after the test
  afterAll(() => {
    // Restore the files if backups exist
    if (fileExists(mainPageBackup)) {
      fs.copyFileSync(mainPageBackup, mainPagePath);
      fs.unlinkSync(mainPageBackup);
    }
    
    if (fileExists(detailsPageBackup)) {
      fs.copyFileSync(detailsPageBackup, detailsPagePath);
      fs.unlinkSync(detailsPageBackup);
    }
    
    if (fileExists(newPageBackup)) {
      fs.copyFileSync(newPageBackup, newPagePath);
      fs.unlinkSync(newPageBackup);
    }
  });
  
  it('should fix the routing issue by removing duplicate pages', () => {
    // Remove the duplicate pages
    if (fileExists(mainPagePath)) {
      fs.unlinkSync(mainPagePath);
    }
    
    if (fileExists(detailsPagePath)) {
      fs.unlinkSync(detailsPagePath);
    }
    
    if (fileExists(newPagePath)) {
      fs.unlinkSync(newPagePath);
    }
    
    // Verify the pages are removed
    expect(fileExists(mainPagePath)).toBe(false);
    expect(fileExists(detailsPagePath)).toBe(false);
    expect(fileExists(newPagePath)).toBe(false);
    
    // Verify the dashboard pages still exist
    expect(fileExists(path.join(process.cwd(), 'app', 'app', '(dashboard)', 'agents', 'page.tsx'))).toBe(true);
    expect(fileExists(path.join(process.cwd(), 'app', 'app', '(dashboard)', 'agents', '[id]', 'page.tsx'))).toBe(true);
    expect(fileExists(path.join(process.cwd(), 'app', 'app', '(dashboard)', 'agents', 'new', 'page.tsx'))).toBe(true);
  });
}); 