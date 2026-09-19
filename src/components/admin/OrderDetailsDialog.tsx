import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { storeConfig } from '@/config/store';
import { getWhatsAppUrl, createOrderMessage } from '@/lib/whatsappService';
import { updateOrderStatus, updatePaymentStatus } from '@/lib/orderService';
import { useState } from 'react';
import { generateUPILink } from '@/lib/upiService';
import { QRCodeSVG } from 'qrcode.react';

interface OrderDetailsDialogProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function OrderDetailsDialog({ order, onClose, onOrderUpdated }: OrderDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const upiLink = generateUPILink(order.grandTotal, order.id);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    await updateOrderStatus(order.id, e.target.value as Order['orderStatus']);
    setIsUpdating(false);
    onOrderUpdated();
  };

  const handlePaymentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    await updatePaymentStatus(order.id, e.target.value as Order['paymentStatus']);
    setIsUpdating(false);
    onOrderUpdated();
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl(order);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyDetails = async () => {
    const message = createOrderMessage(order);
    try {
      await navigator.clipboard.writeText(message);
      alert('Order details copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Could not copy text automatically.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 bg-stone-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Order {order.orderId}</h2>
            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Customer & Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-800">Customer Details</h3>
              <div className="text-sm">
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-slate-600">{order.mobileNumber}</p>
              </div>
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-500">Delivery Address</h4>
                <p className="text-sm text-slate-700 mt-1">{order.address}</p>
                <p className="text-sm text-slate-700">PIN: {order.pinCode}</p>
                {order.deliveryInstructions && (
                  <p className="text-xs text-amber-700 mt-1 bg-amber-50 p-1.5 rounded">
                    Note: {order.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Order Management</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Order Status</label>
                <select 
                  value={order.orderStatus}
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  className="w-full text-sm border-stone-300 rounded-lg p-2 focus:ring-[#F98866]"
                >
                  <option value="NEW">New</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Status</label>
                <select 
                  value={order.paymentStatus}
                  onChange={handlePaymentChange}
                  disabled={isUpdating}
                  className="w-full text-sm border-stone-300 rounded-lg p-2 focus:ring-[#F98866]"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Payment Collection</h4>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-white p-3 rounded-lg border border-stone-200">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <QRCodeSVG value={upiLink} size={90} />
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-xs text-slate-600">
                      Send this link to the customer so they can pay {formatPrice(order.grandTotal)} instantly via GPay/PhonePe/Paytm.
                    </p>
                    
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(upiLink);
                        alert('UPI Payment Link copied to clipboard!');
                      }}
                      className="w-full py-2 px-3 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      Copy Payment Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-3">Order Items</h3>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-slate-500">
                  <tr>
                    <th className="p-3 font-semibold">Item</th>
                    <th className="p-3 font-semibold text-center">Qty</th>
                    <th className="p-3 font-semibold text-right">Price</th>
                    <th className="p-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-500">{item.weight}</div>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-stone-50 p-4 border-t border-stone-200 space-y-1 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span>{formatPrice(order.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base mt-2 pt-2 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex flex-wrap gap-3 justify-end">
          <button 
            onClick={handleCopyDetails}
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100"
          >
            Copy Details
          </button>
          <button 
            onClick={handleOpenWhatsApp}
            className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            Chat with Customer
          </button>
        </div>
      </div>
    </div>
  );
}
