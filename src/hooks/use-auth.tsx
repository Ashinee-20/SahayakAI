
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { app } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = getAuth(app);

  useEffect(() => {
    const guestParam = searchParams.get('guest');
    if (guestParam === 'true') {
      setIsGuest(true);
      setLoading(false);
      setInitialLoad(false);
      if (pathname === '/') {
        router.push('/home');
      }
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setInitialLoad(false);
      
      // If user just signed in and we're on the root page, redirect to home
      if (firebaseUser && pathname === '/') {
        router.push('/home');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading || initialLoad) return; // Wait until loading is complete

    const isAuthPage = pathname === '/';

    // Redirect logic
    if ((user || isGuest) && isAuthPage) {
      router.push('/home');
    } else if (!user && !isGuest && !isAuthPage) {
      router.push('/');
    }
  }, [user, loading, isGuest, pathname, router, initialLoad]);

  if (loading || initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
