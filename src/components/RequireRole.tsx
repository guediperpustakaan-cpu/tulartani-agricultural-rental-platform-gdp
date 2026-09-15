"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/store/useAuth";

export default function RequireRole({
  role,
  children,
}: {
  role?: "OWNER" | "RENTER" | "ADMIN";
  children: React.ReactNode;
}) {
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/masuk");
      return;
    }
    if (role && user.role !== role) {
      router.replace(
        user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/pemilik" : "/renter/pesanan"
      );
      return;
    }
    setReady(true);
  }, [user, role, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }

  return <>{children}</>;
}
