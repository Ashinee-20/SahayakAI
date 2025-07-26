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
    if (searchParams.get('guest') === 'true') {
      setIsGuest(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!loading && !user && !isGuest && pathname !== '/') {
      router.push('/');
    }
    if (!loading && user && pathname === '/') {
        router.push('/home');
    }
  }, [user, loading, pathname, router, isGuest]);

  if (loading || (!user && !isGuest && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if ((!user && pathname === '/') || isGuest) {
     return (
      <AuthContext.Provider value={{ user: user, loading: loading, isGuest: isGuest }}>
        {children}
      </AuthContext.Provider>
    );
  }

  if (user) {
    return (
      <AuthContext.Provider value={{ user, loading, isGuest }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return null;
};

export const useAuth = () => useContext(AuthContext);
