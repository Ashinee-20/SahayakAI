import { AuthProvider } from '@/hooks/use-auth';
import { सस्पेंस } from 'react';
import { Loader2 } from 'lucide-react';

export default function SuspenseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <सस्पेंस
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </सस्पेंस>
  );
}
