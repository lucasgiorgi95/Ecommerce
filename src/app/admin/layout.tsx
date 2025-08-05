import AdminSidebar from '@/components/admin/AdminSidebar';
import ToastProvider from '@/components/admin/ToastProvider';
import AdminProtection from '@/components/admin/AdminProtection';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtection>
      <ToastProvider>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </ToastProvider>
    </AdminProtection>
  );
}