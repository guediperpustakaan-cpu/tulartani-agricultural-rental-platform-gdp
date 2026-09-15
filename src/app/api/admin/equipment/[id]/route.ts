import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya admin yang dapat memverifikasi alat." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const isVerified = Boolean(body.is_verified);

  const [updated] = await db
    .update(equipment)
    .set({ isVerified })
    .where(eq(equipment.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ equipment: updated });
}
