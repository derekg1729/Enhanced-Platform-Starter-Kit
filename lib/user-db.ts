import { eq } from "drizzle-orm";
import db from "./db";
import { users } from "./schema";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  return user || null;
}

/**
 * Gets a user by email address
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user || null;
}

/**
 * Creates a new user
 */
export async function createUser(data: {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
}): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      id: data.id,
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified,
      image: data.image,
    })
    .returning();

  return user;
}

/**
 * Updates a user
 */
export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id'>>
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();

  return user || null;
}

/**
 * Deletes a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const [user] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return !!user;
} 