import { AuthProvider } from '@/hooks/use-auth';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function SuspenseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}
