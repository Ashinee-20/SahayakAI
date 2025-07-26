import type { ReactNode, Suspense } from 'react';
import MainSidebar from '@/components/main-sidebar';
import Header from '@/components/header';
import { LanguageProvider } from '@/context/language-context';
import { Loader2 } from 'lucide-react';
import SuspenseAuthProvider from '@/components/suspense-auth-provider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen w-full flex">
        <MainSidebar />
        <div className="flex flex-col flex-1">
          <SuspenseAuthProvider>
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
              {children}
            </main>
          </SuspenseAuthProvider>
        </div>
      </div>
    </LanguageProvider>
  );
}
