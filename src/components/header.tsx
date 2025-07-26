'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu,
  BookOpenCheck,
  Home,
  LayoutGrid,
  User,
  Users,
  Settings
} from 'lucide-react';
import UserNav from './user-nav';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/create', label: 'Create', icon: LayoutGrid },
  { href: '/my-space', label: 'My Space', icon: User },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {/* The desktop sidebar handles this, so this can be empty or used for breadcrumbs */}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/home"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <BookOpenCheck className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">Sahayak</span>
            </Link>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                  (pathname === href || (href !== '/home' && pathname.startsWith(href))) && 'text-foreground bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Can add a search bar here if needed */}
        </div>
        <UserNav />
      </div>
    </header>
  );
}
