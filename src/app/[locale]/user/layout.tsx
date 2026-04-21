'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (Providers already handled auth validation)
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userType={typeof user?.userType === 'object' ? user?.userType?.name : user?.userType}
      />

      <div className="lg:pl-64 pt-16">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="py-4 sm:py-6 lg:py-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}