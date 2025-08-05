"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function ConditionalFooter() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Mientras carga, mostrar el footer para evitar flash
  if (isLoading) {
    return <Footer />;
  }

  // Ocultar solo si:
  // 1. El usuario está autenticado
  // 2. Es admin
  // 3. Está en una ruta de admin
  const shouldHide = user?.role === 'admin' && pathname.startsWith('/admin');

  if (shouldHide) {
    return null;
  }

  return <Footer />;
}