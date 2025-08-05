"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function ConditionalNavigation() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Mientras carga, mostrar los componentes para evitar flash
  if (isLoading) {
    return (
      <>
        <Navbar />
        <WhatsAppButton />
      </>
    );
  }

  // Ocultar solo si:
  // 1. El usuario está autenticado
  // 2. Es admin
  // 3. Está en una ruta de admin
  const shouldHide = user?.role === 'admin' && pathname.startsWith('/admin');

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <Navbar />
      <WhatsAppButton />
    </>
  );
}