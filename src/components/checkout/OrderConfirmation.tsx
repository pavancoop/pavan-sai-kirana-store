'use client';

import { useState } from 'react';
import { storeConfig } from '@/config/store';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import { getWhatsAppUrl, createOrderMessage } from '@/lib/whatsappService';

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
}

export default function OrderConfirmation({ order, onContinueShopping }: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  const handleOpenWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setWhatsappOpened(true);

    const url = getWhatsAppUrl(order);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyOrder = async () => {
    const message = createOrderMessage(order);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text', err);
      // Fallback for when clipboard API is not available
      alert('Could not copy automatically. The order details will be shown below.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-emerald-200 p-6 sm:p-7 text-center space-y-4">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
        🎉
      </div>

      <div className="space-y-1">
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          Order Received!
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Your order:
        </h3>
        <p className="font-mono font-bold text-slate-900 text-lg">
          {order.orderId}
        </p>
        <p className="text-sm font-bold text-slate-700">
          Total: {formatPrice(order.grandTotal)}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left">
        <strong>Important:</strong> WhatsApp will open with your order details. Please press <strong>SEND</strong> to send the order to {storeConfig.name}.
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <a
          href="#"
          onClick={handleOpenWhatsApp}
          className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
          <span>SEND ORDER ON WHATSAPP</span>
        </a>
        
        {whatsappOpened && (
          <div className="text-xs text-slate-500">
            If WhatsApp could not be opened, you can <button onClick={handleCopyOrder} className="text-[#c24b27] font-bold underline">copy your order details</button> and contact the store manually.
            {copied && <span className="text-emerald-600 font-bold ml-1">Copied!</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={`tel:${storeConfig.phone}`}
            className="py-2.5 px-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Store</span>
          </a>
          <button
            onClick={onContinueShopping}
            className="py-2.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
