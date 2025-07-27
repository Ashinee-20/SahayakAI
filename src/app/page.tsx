'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, ChevronRight, Loader2, User } from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const { user } = useAuth();

  useEffect(() => {
    // Check for redirect result when the component mounts
    const checkRedirectResult = async () => {
      setIsLoading(true);
      try {
        await getRedirectResult(auth);
        // AuthProvider will handle redirecting to '/home' if successful
      } catch (error) {
        console.error('Error getting redirect result:', error);
      } finally {
        // Only stop loading if there isn't a user, otherwise AuthProvider is handling it
        if (!auth.currentUser) {
            setIsLoading(false);
        }
      }
    };
    checkRedirectResult();
  }, [auth]);

  if (user) {
    router.push('/home');
    return null; // Render nothing while redirecting
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    // Request scopes for Google Forms API
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    
    // We use signInWithRedirect which is more robust against popup blockers
    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <BookOpenCheck className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-headline font-bold text-gray-800">
          Sahayak
        </h1>
        <p className="mt-2 text-xl text-muted-foreground italic">
          Create, Share, Adapt
        </p>
        <p className="mt-6 text-lg text-gray-600">
          Your AI-powered teaching assistant for low-resource, multi-grade classrooms.
        </p>

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
                <User className="mr-2 h-4 w-4"/>
                Continue as Guest
            </Link>
          </Button>
        </div>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Built for teachers, by teachers (and a little help from AI).
      </footer>
    </div>
  );
}
