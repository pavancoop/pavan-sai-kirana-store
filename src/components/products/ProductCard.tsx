'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

// Map category to emoji for visual product placeholder
function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'rice-grains': '🍚',
    'dal-pulses': '🌾',
    'oils': '🌻',
    'spices-masalas': '🌶️',
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

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const isLowStock = product.stockStatus === 'low_stock';

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl border border-orange-100/90 shadow-sm hover:shadow-md transition-shadow p-2.5 sm:p-4 flex flex-col justify-between relative group ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* Discount Pill */}
      {product.discount > 0 && (
        <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs z-10">
          {product.discount}% OFF
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md z-10">
          Out of Stock
        </div>
      )}

      {/* Product Visual / Icon Box */}
      <div className="w-full aspect-[4/3] sm:aspect-square max-h-24 sm:max-h-36 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#FFFDF9] to-[#FFF2D7]/40 flex items-center justify-center overflow-hidden mb-2 sm:mb-3 border border-orange-50 select-none">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl sm:text-5xl">{getCategoryEmoji(product.category)}</span>
        )}
      </div>

      {/* Product Content */}
      <div className="space-y-1.5 flex-1">
        {/* Brand */}
        <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {product.brand}
        </div>

        {/* Product Name */}
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2" title={product.name}>
          {product.weight} - {product.name}
        </h4>

        {/* Weight Pill Badge */}
        <div className="inline-block bg-stone-100 text-stone-700 text-[11px] font-extrabold px-2 py-0.5 rounded">
          {product.weight}
        </div>
      </div>

      {/* Price & Add Button Row */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-orange-50/80 flex items-end justify-between gap-1.5 sm:gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          {!isOutOfStock && (
            <div className="text-[10px] text-emerald-700 font-bold">
              {isLowStock ? 'Few Left' : 'In Stock'}
            </div>
          )}
        </div>

        {/* Add to Cart CTA / Quantity Selector */}
        <div className="shrink-0">
          {isOutOfStock ? (
            <button
              disabled
              className="h-8 sm:h-10 min-w-[64px] sm:min-w-[76px] px-2.5 sm:px-3 rounded-full bg-gray-100 text-gray-400 font-bold text-[11px] sm:text-xs cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="h-8 sm:h-10 min-w-[64px] sm:min-w-[76px] px-2.5 sm:px-3 rounded-full bg-[#FFF2D7] text-[#c24b27] hover:bg-[#F98866] hover:text-white font-extrabold text-[11px] sm:text-xs border border-orange-200 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 active:scale-95"
              aria-label={`Add ${product.name} to cart`}
            >
              <span className="text-xs sm:text-sm font-black">+</span>
              <span>ADD</span>
            </button>
          ) : (
            <div className="h-8 sm:h-10 flex items-center bg-[#F98866] text-white rounded-full shadow-sm px-0.5 sm:px-1 font-bold text-[11px] sm:text-xs">
              <button
                onClick={() => decrementItem(product.id)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 text-xs sm:text-sm font-black"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-1 sm:px-2 font-black text-xs sm:text-sm min-w-[16px] sm:min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => incrementItem(product.id)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 text-xs sm:text-sm font-black"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
