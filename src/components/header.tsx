
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
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
import { useTranslation } from '@/hooks/use-translation';
import LanguageToggle from './language-toggle';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/home', labelKey: 'home', icon: Home },
  { href: '/create', labelKey: 'create.title', icon: LayoutGrid },
  { href: '/my-space', labelKey: 'mySpace.title', icon: User },
  { href: '/community', labelKey: 'community.title', icon: Users },
  { href: '/settings', labelKey: 'settings.title', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();

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
            <SheetHeader>
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                 <Link
                    href="/home"
                    className="flex items-center gap-2 text-lg font-semibold"
                    >
                    <BookOpenCheck className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl">Sahayak</span>
                </Link>
            </SheetHeader>
            <Separator className="my-4" />
          <nav className="grid gap-4 text-lg font-medium">
            {navItems.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={labelKey}
                href={href}
                className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                  (pathname === href || (href !== '/home' && pathname.startsWith(href))) && 'text-foreground bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                {t(labelKey)}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <LanguageToggle />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
