'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/authService';
import AdminAuthProvider from '@/components/admin/AdminAuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
        {/* Sidebar (Desktop) / Top Nav (Mobile) - Hidden on Login Page */}
        {!isLoginPage && (
          <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between">
            <div className="p-4 md:p-6">
              <Link href="/admin/orders" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-[#F98866] flex items-center justify-center text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="font-extrabold text-lg">Store Admin</span>
              </Link>

              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                <Link 
                  href="/admin/orders"
                  className={`px-4 py-2 rounded-lg ${pathname.includes('/orders') ? 'bg-white/10' : 'hover:bg-white/10'} text-sm font-bold transition-colors whitespace-nowrap`}
                >
                  📦 Orders
                </Link>
                <Link 
                  href="/admin/products"
                  className={`px-4 py-2 rounded-lg ${pathname.includes('/products') ? 'bg-white/10' : 'hover:bg-white/10'} text-sm font-bold transition-colors whitespace-nowrap`}
                >
                  🏷️ Products
                </Link>
                <Link 
                  href="/admin/calculator"
                  className={`px-4 py-2 rounded-lg ${pathname.includes('/calculator') ? 'bg-white/10' : 'hover:bg-white/10'} text-sm font-bold transition-colors whitespace-nowrap`}
                >
                  🧮 Calculator
                </Link>
                <Link 
                  href="/"
                  className="px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-bold text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  👀 View Storefront
                </Link>
              </nav>
            </div>
            
            <div className="p-4 md:p-6">
              <button 
                onClick={logoutAdmin}
                className="w-full px-4 py-2 rounded-lg hover:bg-red-500/20 text-sm font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 w-full max-w-7xl mx-auto ${!isLoginPage ? 'p-4 sm:p-6 md:p-8' : ''}`}>
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
