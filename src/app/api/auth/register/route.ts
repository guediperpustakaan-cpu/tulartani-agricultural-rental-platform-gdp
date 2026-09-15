import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, publicUser, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      address?: string;
      role?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan kata sandi wajib diisi." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
    }
    const validRole = role === "OWNER" || role === "RENTER" ? role : "RENTER";

    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        phone: phone ?? null,
        address: address ?? null,
        role: validRole,
        is_verified: false,
      })
      .returning();

    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
