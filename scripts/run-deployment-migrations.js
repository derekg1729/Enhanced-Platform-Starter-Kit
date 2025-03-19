#!/usr/bin/env node
/**
 * This script runs deployment-specific migrations.
 * It's designed to be executed during the Vercel build process.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function runDeploymentMigrations() {
  // The environment variables will be provided by Vercel in production
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Running deployment-specific migrations...');
  
  const client = new Client({
    connectionString
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Get all SQL files in the deployment-fix directory
    const migrationDir = path.join(process.cwd(), 'drizzle', 'migrations', 'deployment-fix');
    const files = fs.readdirSync(migrationDir)
                   .filter(file => file.endsWith('.sql'))
                   .sort();
    
    if (files.length === 0) {
      console.log('ℹ️ No deployment-specific migrations found');
      return;
    }
    
    console.log(`🔄 Found ${files.length} deployment migration files to run`);
    
    // Run each migration file
    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🔄 Running migration: ${file}`);
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log(`✅ Successfully ran migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error running migration ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('✅ All deployment migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Error running deployment migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migrations
runDeploymentMigrations().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 