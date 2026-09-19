import { storeConfig } from '@/config/store';

/**
 * Generates a UPI intent link for deep linking to payment apps (GPay, PhonePe, Paytm).
 * 
 * Format: upi://pay?pa={UPI_ID}&pn={STORE_NAME}&am={AMOUNT}&tr={ORDER_ID}&cu=INR
 * 
 * @param amount Total amount to pay
 * @param orderId Unique order ID (used as transaction reference)
 * @returns Formatted UPI string
 */
export function generateUPILink(amount: number, orderId: string): string {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'yourupi@bank';
  const storeName = storeConfig.name;
  
  const params = new URLSearchParams({
    pa: upiId,
    pn: storeName,
    am: amount.toFixed(2),
    tr: orderId, // Transaction Reference ID
    cu: 'INR'
  });

  return `upi://pay?${params.toString()}`;
}
