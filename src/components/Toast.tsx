"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  success: "border-green-600/30 bg-green-50 text-green-800",
  error: "border-red-600/30 bg-red-50 text-red-800",
  info: "border-amber-500/40 bg-amber-50 text-amber-800",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur",
            "animate-[slideIn_.25s_ease-out]",
            styles[t.type]
          )}
        >
          {t.type === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
          {t.type === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          {t.type === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
