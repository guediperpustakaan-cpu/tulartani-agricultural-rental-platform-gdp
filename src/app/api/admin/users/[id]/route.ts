import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, publicUser } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat memverifikasi pengguna." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const is_verified = Boolean(body.is_verified);

  const [updated] = await db
    .update(users)
    .set({ is_verified })
    .where(eq(users.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ user: publicUser(updated) });
}
