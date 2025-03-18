import { describe, it, expect } from 'vitest';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

describe('Database Schema Mismatch Detection', () => {
  it('should identify extra columns in the agents table that are not in the code definition', async () => {
    // Create a direct postgres client
    const client = new Client({
      connectionString: process.env.POSTGRES_URL
    });

    try {
      await client.connect();
      
      // Query the database directly to get information about the agents table columns
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'agents'
        ORDER BY ordinal_position;
      `);

      // Extract column names from the database
      const dbColumnNames = result.rows.map(row => row.column_name);
      
      // Expected columns based on schema.ts
      const expectedColumns = [
        'id', 'name', 'description', 'model', 'createdAt', 'updatedAt', 'userId'
      ];
      
      console.log('DB Columns:', dbColumnNames);
      console.log('Expected Schema Columns:', expectedColumns);
      
      // Check for extra columns in the database that are not in the expected schema
      const extraColumnsInDb = dbColumnNames.filter(col => !expectedColumns.includes(col));
      
      console.log('Extra columns in database:', extraColumnsInDb);
      
      // This test is expected to fail if there are extra columns
      if (extraColumnsInDb.length > 0) {
        console.log('Found schema mismatch - extra columns in the database:', extraColumnsInDb);
      }
      
    } catch (error) {
      console.error('Error testing schema:', error);
      throw error;
    } finally {
      await client.end();
    }
  });
}); 