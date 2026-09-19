'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { storeConfig } from '@/config/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { state, incrementItem, decrementItem, removeItem, clearCart, isMinimumMet, amountToMinimum } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-100 flex items-center justify-between bg-[#FFF2D7]/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F98866] text-white flex items-center justify-center font-bold text-sm">
              🛒
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Your Shopping Cart</h3>
              <span className="text-xs text-slate-500">{state.totalItems} item{state.totalItems !== 1 ? 's' : ''} selected</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white text-slate-500 hover:text-slate-800 transition-colors" aria-label="Close Cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Minimum Order Alert */}
        {!isMinimumMet && state.items.length > 0 && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Minimum order is {formatPrice(storeConfig.minimumOrderValue)}. Add {formatPrice(amountToMinimum)} more.</span>
            </div>
            <span className="font-bold text-[#c24b27] shrink-0">Min {formatPrice(storeConfig.minimumOrderValue)}</span>
          </div>
        )}

        {/* Cart Items */}
        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="text-5xl">🛍️</div>
            <h4 className="font-bold text-slate-800 text-base">Your Kirana Cart is Empty</h4>
            <p className="text-xs text-slate-500 max-w-xs">Browse our lentils, grains, oils, and snacks to begin building your basket.</p>
            <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-[#F98866] text-white font-bold text-xs hover:bg-[#e56b46]">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {state.items.map(item => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="w-14 h-14 bg-gradient-to-b from-[#FFFDF9] to-[#FFF2D7]/40 rounded-lg flex items-center justify-center text-2xl shrink-0 border border-orange-50">
                  🛒
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.product.weight} • {formatPrice(item.product.sellingPrice)} each</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-white">
                      <button onClick={() => decrementItem(item.product.id)} className="px-2.5 py-1 text-slate-600 hover:text-[#F98866] font-bold" aria-label="Decrease">−</button>
                      <span className="px-2 py-1 text-xs font-extrabold text-slate-900 min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => incrementItem(item.product.id)} className="px-2.5 py-1 text-slate-600 hover:text-[#F98866] font-bold" aria-label="Increase">+</button>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{formatPrice(item.product.sellingPrice * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="self-start p-1 text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {state.items.length > 0 && (
              <button onClick={clearCart} className="w-full text-center text-xs text-red-500 hover:text-red-600 py-2">Clear Cart</button>
            )}
          </div>
        )}

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="p-4 border-t border-orange-100 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(state.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Delivery (Target 30 min)</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between text-sm">
                <span className="font-extrabold text-slate-900">Grand Total</span>
                <span className="font-extrabold text-slate-900 text-base">{formatPrice(state.grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => { onCheckout(); onClose(); }}
              disabled={!isMinimumMet}
              className={`w-full py-3.5 px-4 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isMinimumMet
                  ? 'bg-[#F98866] hover:bg-[#e56b46] text-white active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>{isMinimumMet ? `Proceed to Checkout • ${formatPrice(state.grandTotal)}` : `Add ${formatPrice(amountToMinimum)} more to checkout`}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
