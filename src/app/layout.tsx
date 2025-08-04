import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ClientCartProvider from "@/components/ClientCartProvider";
import ClientAuthProvider from "@/components/ClientAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda - Tienda Online",
  description: "Tienda online con los mejores productos para ti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ClientAuthProvider>
          <ClientCartProvider>
            {/* Ocultar Navbar en rutas /admin */}
            {typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin') && <Navbar />}
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            {/* Ocultar WhatsApp en rutas /admin */}
            {typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin') && <WhatsAppButton />}
          </ClientCartProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
