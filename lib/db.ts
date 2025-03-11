import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from "./schema";

// Declare global types for our query cache
declare global {
  var _queryCache: Map<string, boolean> | undefined;
  var _queryCacheTimeout: NodeJS.Timeout | null | undefined;
}

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Create a database connection with conditional logging
export const db = drizzle(sql, { 
  schema, 
  // Only enable logging in development mode, and only for non-repetitive queries
  logger: isDevelopment ? {
    logQuery: (query, params) => {
      // Use a simple debounce mechanism with a query cache to avoid logging the same query repeatedly
      if (!global._queryCache) {
        global._queryCache = new Map();
        global._queryCacheTimeout = null;
      }
      
      const queryKey = `${query}${JSON.stringify(params)}`;
      
      // If this exact query was logged recently, don't log it again
      if (global._queryCache.has(queryKey)) {
        return;
      }
      
      // Add to cache and set expiration
      global._queryCache.set(queryKey, true);
      
      // Clear cache after 2 seconds to allow the same query to be logged again later
      clearTimeout(global._queryCacheTimeout as NodeJS.Timeout);
      global._queryCacheTimeout = setTimeout(() => {
        if (global._queryCache) {
          global._queryCache.clear();
        }
      }, 2000);
      
      console.log('Query:', query, 'Params:', params);
    }
  } : false
});

export default db;

export type DrizzleClient = typeof db;
