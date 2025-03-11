import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Agent Directory Fix', () => {
  // Backup paths for the duplicate directories
  const backupDir = path.join(process.cwd(), 'tests', '__backups__');
  const appAgentsBackup = path.join(backupDir, 'app-agents-backup');
  const appAppAgentsBackup = path.join(backupDir, 'app-app-agents-backup');
  
  // Original paths for the duplicate directories
  const appAgentsPath = path.join(process.cwd(), 'app', 'agents');
  const appAppAgentsPath = path.join(process.cwd(), 'app', 'app', 'agents');
  
  // Check if a directory exists
  const directoryExists = (dirPath: string): boolean => {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  };
  
  // Create backup directory if it doesn't exist
  beforeAll(() => {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup the directories if they exist
    if (directoryExists(appAgentsPath)) {
      // Use cp -r to copy directories recursively
      execSync(`cp -r "${appAgentsPath}" "${appAgentsBackup}"`);
    }
    
    if (directoryExists(appAppAgentsPath)) {
      execSync(`cp -r "${appAppAgentsPath}" "${appAppAgentsBackup}"`);
    }
  });
  
  // Restore the directories after the test
  afterAll(() => {
    // Restore the directories if backups exist
    if (directoryExists(appAgentsBackup)) {
      if (directoryExists(appAgentsPath)) {
        execSync(`rm -rf "${appAgentsPath}"`);
      }
      execSync(`cp -r "${appAgentsBackup}" "${appAgentsPath}"`);
      execSync(`rm -rf "${appAgentsBackup}"`);
    }
    
    if (directoryExists(appAppAgentsBackup)) {
      if (directoryExists(appAppAgentsPath)) {
        execSync(`rm -rf "${appAppAgentsPath}"`);
      }
      execSync(`cp -r "${appAppAgentsBackup}" "${appAppAgentsPath}"`);
      execSync(`rm -rf "${appAppAgentsBackup}"`);
    }
  });
  
  it('should fix the directory structure by removing duplicate directories', () => {
    // Remove the duplicate directories
    if (directoryExists(appAgentsPath)) {
      execSync(`rm -rf "${appAgentsPath}"`);
    }
    
    if (directoryExists(appAppAgentsPath)) {
      execSync(`rm -rf "${appAppAgentsPath}"`);
    }
    
    // Verify the directories are removed
    expect(directoryExists(appAgentsPath)).toBe(false);
    expect(directoryExists(appAppAgentsPath)).toBe(false);
    
    // Verify the dashboard directory still exists
    const dashboardAgentsPath = path.join(process.cwd(), 'app', 'app', '(dashboard)', 'agents');
    expect(directoryExists(dashboardAgentsPath)).toBe(true);
  });
}); 