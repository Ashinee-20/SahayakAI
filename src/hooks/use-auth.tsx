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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = getAuth(app);

  useEffect(() => {
    const guestParam = searchParams.get('guest');
    if (guestParam === 'true') {
      setIsGuest(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return; // Don't run logic until auth state is confirmed

    const isAuthPage = pathname === '/';

    // If there's a user or it's a guest session, and they are on the login page, redirect to home.
    if ((user || isGuest) && isAuthPage) {
      router.push('/home');
    }
    // If there's no user and it's not a guest session, and they are on a protected page, redirect to login.
    else if (!user && !isGuest && !isAuthPage) {
      router.push('/');
    }
  }, [user, loading, isGuest, pathname, router]);
  
  // This loading state is crucial. It prevents rendering of the app until we know if a user is logged in or not.
  if (loading) {
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
