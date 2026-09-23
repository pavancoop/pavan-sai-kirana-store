import { storeConfig } from '@/config/store';
import { Product, ProductGroup } from '@/types';

export function groupProductsByName(products: Product[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  products.forEach(product => {
    // We group by the clean base name (lowercased)
    const baseName = product.name.trim();
    const groupKey = baseName.toLowerCase();

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        id: groupKey.replace(/[^a-z0-9]+/g, '-'),
        name: baseName,
        brand: product.brand,
        category: product.category,
        image: product.image,
        imageUrl: product.imageUrl,
        imageSource: product.imageSource,
        imageStatus: product.imageStatus,
        variants: [],
        minPrice: product.sellingPrice,
        maxDiscount: product.discount,
      });
    }

    const group = groups.get(groupKey)!;
    group.variants.push(product);
    
    // Update min price and max discount
    if (product.sellingPrice < group.minPrice) group.minPrice = product.sellingPrice;
    if (product.discount > group.maxDiscount) group.maxDiscount = product.discount;
    // Prefer image if current group has none
    if (!group.image && product.image) {
      group.image = product.image;
      group.imageUrl = product.imageUrl;
      group.imageSource = product.imageSource;
      group.imageStatus = product.imageStatus;
      group.imageUpdatedAt = product.imageUpdatedAt;
    }
    // Prefer actual imageUrl if only legacy image exists
    if (!group.imageUrl && product.imageUrl) {
      group.imageUrl = product.imageUrl;
      group.imageSource = product.imageSource;
      group.imageStatus = product.imageStatus;
      group.imageUpdatedAt = product.imageUpdatedAt;
    }
    
    // Collect unique additional images
    if (product.additionalImages && product.additionalImages.length > 0) {
      if (!group.additionalImages) group.additionalImages = [];
      product.additionalImages.forEach(img => {
        if (!group.additionalImages!.includes(img)) {
          group.additionalImages!.push(img);
        }
      });
    }
  });

  // Sort variants within each group (e.g. by selling price ascending, which loosely correlates to weight)
  Array.from(groups.values()).forEach(group => {
    group.variants.sort((a, b) => a.sellingPrice - b.sellingPrice);
  });

  return Array.from(groups.values());
}

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
