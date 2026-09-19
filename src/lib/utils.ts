import { storeConfig } from '@/config/store';

export function formatPrice(price: number): string {
  return `${storeConfig.currency}${price.toFixed(0)}`;
}

export function formatPriceDecimal(price: number): string {
  return `${storeConfig.currency}${price.toFixed(2)}`;
}

export function calculateDiscount(mrp: number, sellingPrice: number): number {
  if (mrp <= 0 || sellingPrice >= mrp) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}


export function validateMobileNumber(number: string): boolean {
  const cleaned = number.replace(/\s/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

export function validatePinCode(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
