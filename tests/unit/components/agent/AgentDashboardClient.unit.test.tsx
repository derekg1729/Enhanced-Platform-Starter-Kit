import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

describe('AgentDashboard Client Component', () => {
  it('should have "use client" directive at the top of the file', () => {
    // Read the actual file content
    const filePath = resolve(__dirname, '../../../../components/agent/AgentDashboard.tsx');
    const fileContent = readFileSync(filePath, 'utf8');
    
    // Check if the file starts with the "use client" directive
    expect(fileContent.trim().startsWith('"use client";')).toBe(true);
  });
}); 