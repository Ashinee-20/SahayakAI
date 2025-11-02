'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, User } from 'lucide-react';
import Link from 'next/link';

interface SignInOptionsProps {
  isLoading: boolean;
  handleGoogleSignIn: () => void;
}

export const SignInOptions = ({ isLoading, handleGoogleSignIn }: SignInOptionsProps) => {
  return (
    <div className="mt-10 space-y-4">
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            Sign in with Google
            <ChevronRight className="ml-2" />
          </>
        )}
      </Button>
      <Button
        asChild
        variant="link"
        className="text-muted-foreground"
      >
        <Link href="/home?guest=true">
          <User className="mr-2 h-4 w-4" />
          Continue as Guest
        </Link>
      </Button>
    </div>
  );
};
