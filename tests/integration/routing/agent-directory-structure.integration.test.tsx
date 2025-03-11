import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Agent Directory Structure', () => {
  // Check if directories exist
  const directoryExists = (dirPath: string): boolean => {
    return fs.existsSync(path.join(process.cwd(), dirPath)) && 
           fs.statSync(path.join(process.cwd(), dirPath)).isDirectory();
  };

  it('should have agent pages only in the dashboard layout', () => {
    // The dashboard agent directory should exist
    expect(directoryExists('app/app/(dashboard)/agents')).toBe(true);
    
    // The duplicate agent directories should not exist
    expect(directoryExists('app/agents')).toBe(false);
    expect(directoryExists('app/app/agents')).toBe(false);
    
    // The dashboard agent pages should exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/app/(dashboard)/agents/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'app/app/(dashboard)/agents/[id]/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'app/app/(dashboard)/agents/new/page.tsx'))).toBe(true);
  });
}); 