import { Product, ProductGroup } from '@/types';

// Map specific product keywords to relevant emojis/illustrations
// This prevents every "Dal" from looking like a peanut, or every "Vegetable" looking like a tomato.
const PRODUCT_SPECIFIC_FALLBACKS: Record<string, string> = {
  // Vegetables
  'garlic': '🧄',
  'onion': '🧅',
  'tomato': '🍅',
  'potato': '🥔',
  'chilli': '🌶️',
  'ginger': '🫚', // Modern emoji, might fallback to generic
  'carrot': '🥕',
  'lemon': '🍋',
  'leaf': '🥬',

  // Grains & Dals
  'rice flour': '🥡',
  'rice': '🍚',
  'chana': '🥘',
  'toor': '🥣',
  'urad': '🥣',
  'dal': '🥣',
  'pappu': '🥣',
  'pesara': '🥣',

  // Spices & Condiments
  'salt': '🧂',
  'sugar': '🧊',
  'oil': '🛢️',
  'ghee': '🧈',
  'turmeric': '🟡',
  'masala': '🥘',
  
  // Packaged
  'biscuit': '🍪',
  'snack': '🥨',
  'noodle': '🍜',
  'tea': '🍵',
  'coffee': '☕',
  'peanut': '🥜',
  
  // Household
  'soap': '🧼',
  'wash': '🫧',
  'clean': '🧽',
  'paste': '🪥',
};

// Generic category fallbacks (from categories.ts logic)
function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'rice-grains': '🌾',
    'dal-pulses': '🥜',
    'oils': '🌻',
    'fresh-produce': '🍅',
    'spices-masalas': '🌶️',
    'pooja-religious': '🔔',
    'biscuits-snacks': '🍪',
    'beverages': '🥤',
    'tea-coffee': '☕',
    'breakfast-items': '🥣',
    'packaged-foods': '📦',
    'personal-care': '🧴',
    'household': '🏠',
    'cleaning-products': '🧼',
    'baby-products': '👶',
    'other': '📋',
  };
  return map[category] || '🛒';
}

interface ResolvedImage {
  type: 'image' | 'emoji';
  src: string;
}

/**
 * Resolves the image to display for a product or group.
 * Priority:
 * 1. Real external/uploaded image URL
 * 2. Product-specific semantic illustration/emoji
 * 3. Generic category fallback
 */
export function resolveProductImage(product: Product | ProductGroup): ResolvedImage {
  // 1. Check for real image
  const actualUrl = product.imageUrl || product.image;
  const isReal = product.imageStatus === 'REAL_IMAGE' || (!product.imageStatus && actualUrl);

  if (isReal && actualUrl) {
    // Attach version for cache busting if available
    const versionedUrl = product.imageUpdatedAt 
      ? `${actualUrl}${actualUrl.includes('?') ? '&' : '?'}v=${product.imageUpdatedAt}` 
      : actualUrl;
      
    return { type: 'image', src: versionedUrl };
  }

  // 2. Product-specific fallback
  const nameLower = product.name.toLowerCase();
  for (const [keyword, emoji] of Object.entries(PRODUCT_SPECIFIC_FALLBACKS)) {
    if (nameLower.includes(keyword)) {
      return { type: 'emoji', src: emoji };
    }
  }

  // 3. Generic Category Fallback
  return { type: 'emoji', src: getCategoryEmoji(product.category) };
}
