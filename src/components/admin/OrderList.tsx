'use client';

import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import OrderDetailsDialog from './OrderDetailsDialog';

interface OrderListProps {
  orders: Order[];
  onOrderUpdated: () => void;
}

export default function OrderList({ orders, onOrderUpdated }: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PREPARING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-amber-600 bg-amber-50';
      case 'PAID': return 'text-emerald-600 bg-emerald-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'REFUNDED': return 'text-stone-600 bg-stone-50';
      default: return 'text-stone-600 bg-stone-50';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
        <p className="text-slate-500 mt-1">When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 text-slate-500 border-b border-stone-200">
              <tr>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-mono font-medium text-slate-900">{order.orderId}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.mobileNumber}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {formatPrice(order.grandTotal)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onOrderUpdated={() => {
            onOrderUpdated();
            setSelectedOrder(null); // Close or we can re-fetch and keep open. Let's just close for simplicity.
          }}
        />
      )}
    </>
  );
}
