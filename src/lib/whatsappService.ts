import { Order } from '@/types';
import { storeConfig } from '@/config/store';
import { formatPrice } from './utils';
import { generateUPILink } from './upiService';

/**
 * Service to handle WhatsApp Click-to-Chat functionality.
 * This can later be extended or replaced with official WhatsApp Business API implementations.
 */

/**
 * Normalizes a phone number for WhatsApp URLs.
 * Removes spaces, +, hyphens, brackets.
 */
export function normalizeWhatsAppNumber(number: string): string {
  return number.replace(/[\+\s\-\(\)]/g, '');
}

/**
 * Generates a generic WhatsApp Click-to-Chat URL.
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const number = normalizeWhatsAppNumber(phoneNumber);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Generates the clean, readable WhatsApp message text based on the order.
 */
export function createOrderMessage(order: Order): string {
  const itemLines = order.items
    .map((item) => `${item.productName} × ${item.quantity} — ${formatPrice(item.subtotal)}`)
    .join('\n');

  const upiLink = generateUPILink(order.grandTotal, order.id);

  return `🛒 NEW ORDER - ${storeConfig.name.toUpperCase()}

Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.mobileNumber}

Items:
${itemLines}

Subtotal: ${formatPrice(order.subtotal)}
Delivery: ${formatPrice(order.deliveryCharge)}
Discount: ${formatPrice(order.discount)}
TOTAL: ${formatPrice(order.grandTotal)}

Delivery Address:
${order.address}
PIN Code: ${order.pinCode}
${order.deliveryInstructions ? `\nInstructions:\n${order.deliveryInstructions}\n` : ''}
*Tap here to pay instantly via UPI:*
${upiLink}

Please confirm this order.`;
}

/**
 * Generates the WhatsApp Click-to-Chat URL.
 */
export function getWhatsAppUrl(order: Order): string {
  const number = normalizeWhatsAppNumber(storeConfig.whatsappNumber);
  const message = createOrderMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Attempts to open WhatsApp Click-to-Chat in the browser.
 */
export function openWhatsApp(order: Order): void {
  const url = getWhatsAppUrl(order);
  window.open(url, '_blank', 'noopener,noreferrer');
}
