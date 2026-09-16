import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const VALID_STATUS = ["AVAILABLE", "MAINTENANCE", "RENTED"] as const;

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

  const { id } = await params;
  const equipmentId = Number(id);
  const body = await request.json();
  const status = String(body.status ?? "") as "AVAILABLE" | "MAINTENANCE" | "RENTED";

  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Status alat tidak valid." }, { status: 400 });
  }

  const [item] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, equipmentId))
    .limit(1);
  if (!item) return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
  if (item.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Anda bukan pemilik alat ini." }, { status: 403 });
  }

  const [updated] = await db
    .update(equipment)
    .set({ status })
    .where(eq(equipment.id, equipmentId))
    .returning();

  return NextResponse.json({ equipment: updated });
}
