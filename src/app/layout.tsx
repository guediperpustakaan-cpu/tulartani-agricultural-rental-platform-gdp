import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";

export const metadata: Metadata = {
  title: "TularTani — Sewa Alat Pertanian Modern",
  description:
    "Platform ekonomi berbagi alat pertanian Indonesia. Sewa traktor, drone, dan mesin modern dengan mudah, atau hasilkan penghasilan dari alat yang menganggur.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
