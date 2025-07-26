'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, ChevronRight, Loader2 } from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The auth state change will be handled by a listener in a layout or provider component,
      // which will then redirect to the correct page. For now, we manually redirect.
      router.push('/home');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setIsLoading(false);
    }
    // Don't setIsLoading(false) on success because the page will redirect
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

        <div className="mt-10">
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
          <p className="mt-4 text-sm text-muted-foreground">
            Get started by signing in with your Google account.
          </p>
        </div>
      </div>
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Built for teachers, by teachers (and a little help from AI).
      </footer>
    </div>
  );
}
