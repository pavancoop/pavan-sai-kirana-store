'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/orderService';
import { Order } from '@/types';
import OrderList from '@/components/admin/OrderList';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      if (!isFirebaseConfigured()) {
        setFirebaseConfigured(false);
        setIsLoading(false);
        return;
      }
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!firebaseConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage store orders</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-900 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold">Firebase Not Configured</h2>
          <p className="mt-2 text-sm max-w-md mx-auto">
            The Admin Dashboard requires a real Firebase connection to load orders. Please configure your credentials in <code>.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and process customer orders</p>
        </div>
        
        <button 
          onClick={fetchOrders}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-stone-200 text-sm font-bold text-slate-700 rounded-lg hover:bg-stone-50 shadow-sm disabled:opacity-50 flex items-center gap-2 w-fit"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"></span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      ) : isLoading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-slate-500">
          Loading orders...
        </div>
      ) : (
        <OrderList orders={orders} onOrderUpdated={fetchOrders} />
      )}
    </div>
  );
}
