'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAdminAuthStateChanged } from '@/lib/authService';
import { isFirebaseConfigured } from '@/lib/firebase';

interface AdminAuthProviderProps {
  children: ReactNode;
}

export default function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // If Firebase isn't configured, we let them view the dashboard to see the "Not Configured" state
      setIsChecking(false);
      setIsAuthenticated(true); // Bypass auth if no DB configured to show the warning
      return;
    }

    const unsubscribe = onAdminAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        if (pathname === '/admin/login') {
          router.push('/admin/orders');
        }
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prevent flashing content if not authenticated and trying to access protected route
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
