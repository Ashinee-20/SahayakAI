'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenCheck,
  Home,
  LayoutGrid,
  Settings,
  Users,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/create', label: 'Create', icon: LayoutGrid },
  { href: '/my-space', label: 'My Space', icon: User },
  { href: '/community', label: 'Community', icon: Users },
];

export default function MainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="flex items-center h-16 border-b px-6">
        <Link href="/home" className="flex items-center gap-2 font-semibold">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Sahayak</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                (pathname === href || (href !== '/home' && pathname.startsWith(href))) && 'bg-muted text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Link
            href="/settings"
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                pathname.startsWith('/settings') && 'bg-muted text-primary'
              )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
      </div>
    </aside>
  );
}
