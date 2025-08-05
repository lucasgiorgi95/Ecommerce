import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import ConditionalFooter from "@/components/ConditionalFooter";
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
            <ConditionalNavigation />
            <main className="flex-grow">
              {children}
            </main>
            <ConditionalFooter />
          </ClientCartProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
