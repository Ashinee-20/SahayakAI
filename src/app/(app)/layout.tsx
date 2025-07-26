import type { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import MainSidebar from '@/components/main-sidebar';
import Header from '@/components/header';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full flex">
        <MainSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
