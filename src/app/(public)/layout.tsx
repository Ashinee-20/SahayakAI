import type { ReactNode } from 'react';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold w-fit">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Sahayak</span>
        </Link>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
            {children}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} Sahayak. All rights reserved.
      </footer>
    </div>
  );
}
