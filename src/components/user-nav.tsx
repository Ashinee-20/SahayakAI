'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, Settings, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function UserNav() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const auth = getAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  const handleSignIn = () => {
    router.push('/');
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  if (isGuest) {
    return (
         <Button onClick={handleSignIn}>
            <LogIn className="mr-2 h-4 w-4" />
            {t('signIn')}
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/my-space')}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('mySpace')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
