import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { sql } from '@vercel/postgres';

/**
 * Middleware to set the current user ID for row-level security
 * 
 * This middleware sets the PostgreSQL session variable 'app.current_user_id'
 * to the ID of the authenticated user. This is used by row-level security
 * policies to restrict access to data based on user ownership.
 */
export async function setCurrentUserForRLS(
  req: NextRequest,
  res: NextResponse
): Promise<NextResponse> {
  try {
    // Get the user token from the request
    const token = await getToken({ req });

    if (token?.sub) {
      // Set the current user ID in the PostgreSQL session
      await sql`SELECT set_config('app.current_user_id', ${token.sub}, true)`;
    } else {
      // If no user is authenticated, set the current user ID to an empty string
      // This will cause row-level security policies to block access to all data
      await sql`SELECT set_config('app.current_user_id', '', true)`;
    }

    return res;
  } catch (error) {
    console.error('Error setting current user for RLS:', error);
    return res;
  }
}

/**
 * Middleware to set the current user ID for row-level security in API routes
 * 
 * This middleware is designed to be used in API routes to set the current user ID
 * for row-level security before performing database operations.
 */
export async function withRLS(userId: string | null, callback: () => Promise<any>) {
  try {
    // Set the current user ID in the PostgreSQL session
    if (userId) {
      await sql`SELECT set_config('app.current_user_id', ${userId}, true)`;
    } else {
      await sql`SELECT set_config('app.current_user_id', '', true)`;
    }

    // Execute the callback
    return await callback();
  } finally {
    // Reset the current user ID to an empty string
    await sql`SELECT set_config('app.current_user_id', '', true)`;
  }
} 