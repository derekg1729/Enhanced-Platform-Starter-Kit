import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Agent Routes', () => {
  // Check if files exist
  const fileExists = (filePath: string): boolean => {
    return fs.existsSync(path.join(process.cwd(), filePath));
  };

  it('should have agent pages only in the dashboard layout', () => {
    // The dashboard agent pages should exist
    expect(fileExists('app/app/(dashboard)/agents/page.tsx')).toBe(true);
    expect(fileExists('app/app/(dashboard)/agents/[id]/page.tsx')).toBe(true);
    expect(fileExists('app/app/(dashboard)/agents/new/page.tsx')).toBe(true);
    
    // There should not be duplicate agents pages outside the dashboard layout
    expect(fileExists('app/agents/page.tsx')).toBe(false);
    expect(fileExists('app/agents/[id]/page.tsx')).toBe(false);
    expect(fileExists('app/agents/new/page.tsx')).toBe(false);
  });
}); 