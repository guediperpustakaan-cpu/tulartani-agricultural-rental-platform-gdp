"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "OWNER" | "RENTER" | "ADMIN";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: Role;
  is_verified: boolean;
}

interface AuthState {
  user: SessionUser | null;
  setUser: (u: SessionUser | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null }),
    }),
    { name: "tular-auth" }
  )
);
