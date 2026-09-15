import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";

export const SESSION_COOKIE = "tular_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const calc = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return calc === hash;
}

export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const val = store.get(SESSION_COOKIE)?.value;
  if (!val) return null;
  const id = parseInt(val, 10);
  return Number.isNaN(id) ? null : id;
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export function publicUser(user: User) {
  const { password: _pw, ...rest } = user;
  return rest;
}
