'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Header } from './(public)/components/Header';
import { SignInOptions } from './(public)/components/SignInOptions';
import { Footer } from './(public)/components/Footer';

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const { user } = useAuth();

  useEffect(() => {
    const checkRedirectResult = async () => {
      setIsLoading(true);
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error('Error getting redirect result:', error);
      } finally {
        if (!auth.currentUser) {
            setIsLoading(false);
        }
      }
    };
    checkRedirectResult();
  }, [auth]);

  if (user) {
    router.push('/home');
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md text-center">
        <Header />
        <SignInOptions isLoading={isLoading} handleGoogleSignIn={handleGoogleSignIn} />
      </div>
      <Footer />
    </div>
  );
}
