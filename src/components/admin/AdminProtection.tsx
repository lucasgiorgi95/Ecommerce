"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AdminProtectionProps {
  children: ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
}