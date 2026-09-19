'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice, validateMobileNumber, validatePinCode } from '@/lib/utils';
import { storeConfig } from '@/config/store';
import { CheckoutFormData, FormErrors, Order } from '@/types';
import { createOrder } from '@/lib/orderService';

interface CheckoutFormProps {
  onPlaceOrder: (order: Order) => void;
  onBack: () => void;
}

export default function CheckoutForm({ onPlaceOrder, onBack }: CheckoutFormProps) {
  const { state, isMinimumMet } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    mobileNumber: '',
    address: '',
    pinCode: '',
    deliveryInstructions: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Please enter your name';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Please enter your mobile number';
    else if (!validateMobileNumber(formData.mobileNumber)) newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    if (!formData.address.trim()) newErrors.address = 'Please enter your delivery address';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Please enter your PIN code';
    else if (!validatePinCode(formData.pinCode)) newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !isMinimumMet || state.items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await createOrder(formData, state.items, {
        subtotal: state.subtotal,
        deliveryCharge: state.deliveryCharge,
        discount: state.discount,
        grandTotal: state.grandTotal,
      });
      
      // Still show the confirmation screen in the background
      onPlaceOrder(order);
      
      // Automatically redirect to WhatsApp!
      const { getWhatsAppUrl } = await import('@/lib/whatsappService');
      const url = getWhatsAppUrl(order);
      window.location.href = url; // No popup blocker issues with direct navigation
      
    } catch (error) {
      console.error('[Checkout] Failed to create order:', error);
      setSubmitError('Something went wrong while placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Shopping
      </button>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-orange-100 flex items-center gap-2.5 bg-[#FFF2D7]/60">
          <div className="w-8 h-8 rounded-full bg-[#F98866] text-white flex items-center justify-center font-bold text-sm">📍</div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Delivery & Contact Details</h3>
            <p className="text-[11px] text-slate-500">Pavan Sai Kirana • Local 30 Min Delivery</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Summary Alert */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-600">Order Amount:</span>
              <span className="font-extrabold text-slate-900 text-sm ml-1">{formatPrice(state.grandTotal)}</span>
              <span className="text-slate-500 ml-1">({state.totalItems} items)</span>
            </div>
            {isMinimumMet && (
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Min. Met</span>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Customer Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent ${errors.customerName ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}
            />
            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
          </div>

          {/* Mobile */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Mobile Number (For WhatsApp Updates) <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</div>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full pl-12 pr-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent font-medium ${errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}
              />
            </div>
            <p className="text-[10px] text-slate-400">Order details and UPI payment request will be sent to this WhatsApp number.</p>
            {errors.mobileNumber && <p className="text-xs text-red-500">{errors.mobileNumber}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Delivery Address <span className="text-red-500">*</span></label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Flat/House No., Street Name, Landmark (near temple, bakery, etc.)"
              rows={2}
              className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent resize-none ${errors.address ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* PIN Code */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">PIN Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit postal PIN code"
              maxLength={6}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent ${errors.pinCode ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}
            />
            {errors.pinCode && <p className="text-xs text-red-500">{errors.pinCode}</p>}
          </div>

          {/* Delivery Instructions */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={formData.deliveryInstructions}
              onChange={(e) => handleChange('deliveryInstructions', e.target.value)}
              placeholder="e.g. Ring doorbell twice, leave with security, call before arrival"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent"
            />
          </div>

          {/* Payment Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span>💳 Payment via UPI (GPay/PhonePe/Paytm)</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              You will receive a confirmed payment QR code/UPI link once the store checks and packs your items. No advance payment deducted right now.
            </p>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <div>
                <div className="font-bold">Order Failed</div>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isMinimumMet || state.items.length === 0}
            className={`w-full py-3.5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isSubmitting || !isMinimumMet
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#F98866] hover:bg-[#e56b46] text-white active:scale-95'
            }`}
          >
            <span>{isSubmitting ? 'Placing Order...' : 'Place Order (Proceed to WhatsApp Confirmation)'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
