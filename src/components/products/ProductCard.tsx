'use client';

import { ProductGroup, Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import VariantSelectorDialog from './VariantSelectorDialog';
import { resolveProductImage } from '@/lib/imageResolver';

interface ProductCardProps {
  product: ProductGroup; // Passed a ProductGroup now
}

export default function ProductCard({ product: group }: ProductCardProps) {
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart();
  const [showVariantModal, setShowVariantModal] = useState(false);

  const hasMultipleVariants = group.variants.length > 1;
  const mainProduct = group.variants[0]; // The default product to show

  // Calculate total quantity of all variants of this product in cart
  const totalQuantityInCart = group.variants.reduce((total, v) => total + getItemQuantity(v.id), 0);

  // Consider it out of stock only if ALL variants are out of stock
  const isOutOfStock = group.variants.every(v => v.stockStatus === 'out_of_stock');
  const isLowStock = group.variants.some(v => v.stockStatus === 'low_stock');

  const handleAddClick = () => {
    if (hasMultipleVariants) {
      setShowVariantModal(true);
    } else {
      addItem(mainProduct);
    }
  };

  const resolvedImage = resolveProductImage(group);

  return (
    <>
      <div className={`bg-white rounded-xl sm:rounded-2xl border border-orange-100/90 shadow-sm hover:shadow-md transition-shadow p-2.5 sm:p-4 flex flex-col justify-between relative group ${isOutOfStock ? 'opacity-60' : ''}`}>
        {/* Discount Pill */}
        {group.maxDiscount > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs z-10">
            Up to {group.maxDiscount}% OFF
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md z-10">
            Out of Stock
          </div>
        )}

        {/* Product Visual / Icon Box */}
        <div className="w-full aspect-[4/3] sm:aspect-square max-h-24 sm:max-h-36 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#FFFDF9] to-[#FFF2D7]/40 flex items-center justify-center overflow-hidden mb-2 sm:mb-3 border border-orange-50 select-none relative">
          {resolvedImage.type === 'image' ? (
            <>
              <img 
                src={resolvedImage.src} 
                alt={group.name} 
                className={`w-full h-full object-cover transition-all duration-500 ${group.additionalImages && group.additionalImages.length > 0 ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
                loading="lazy" 
              />
              {group.additionalImages && group.additionalImages.length > 0 && (
                <img 
                  src={group.additionalImages[0]} 
                  alt={`${group.name} alternate`} 
                  className="w-full h-full object-cover transition-all duration-500 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105" 
                  loading="lazy" 
                />
              )}
            </>
          ) : (
            <span className="text-3xl sm:text-5xl opacity-90 transition-transform group-hover:scale-110 duration-300">{resolvedImage.src}</span>
          )}
        </div>

        {/* Product Content */}
        <div className="space-y-1.5 flex-1">
          {/* Brand */}
          <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase line-clamp-1">
            {group.brand || 'Local'}
          </div>

          {/* Product Name */}
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2" title={group.name}>
            {group.name}
          </h4>

          {/* Variants / Weight Pill */}
          <div className="inline-block bg-stone-100 text-stone-700 text-[11px] font-extrabold px-2 py-0.5 rounded">
            {hasMultipleVariants 
              ? `${group.variants.length} Options` 
              : `${mainProduct.weight}${String(mainProduct.weight).toLowerCase().includes(mainProduct.unit.toLowerCase()) ? '' : ` ${mainProduct.unit}`}`}
          </div>
        </div>

        {/* Price & Add Button Row */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-orange-50/80 flex items-end justify-between gap-1.5 sm:gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {formatPrice(group.minPrice)}
              </span>
            </div>
            {!isOutOfStock && (
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                {hasMultipleVariants ? 'Starts at' : (isLowStock ? 'Few Left' : 'In Stock')}
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
            ) : !hasMultipleVariants && totalQuantityInCart > 0 ? (
              <div className="h-8 sm:h-10 flex items-center bg-[#F98866] text-white rounded-full shadow-sm px-0.5 sm:px-1 font-bold text-[11px] sm:text-xs">
                <button
                  onClick={() => decrementItem(mainProduct.id)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 text-xs sm:text-sm font-black"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-1 sm:px-2 font-black text-xs sm:text-sm min-w-[16px] sm:min-w-[20px] text-center">
                  {totalQuantityInCart}
                </span>
                <button
                  onClick={() => incrementItem(mainProduct.id)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 text-xs sm:text-sm font-black"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className={`h-8 sm:h-10 min-w-[64px] sm:min-w-[76px] px-2.5 sm:px-3 rounded-full ${totalQuantityInCart > 0 ? 'bg-[#F98866] text-white' : 'bg-[#FFF2D7] text-[#c24b27]'} hover:bg-[#F98866] hover:text-white font-extrabold text-[11px] sm:text-xs border ${totalQuantityInCart > 0 ? 'border-[#F98866]' : 'border-orange-200'} transition-colors flex items-center justify-center gap-0.5 sm:gap-1 active:scale-95`}
              >
                {hasMultipleVariants ? (
                  <span>OPTIONS {totalQuantityInCart > 0 && `(${totalQuantityInCart})`}</span>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-black">+</span>
                    <span>ADD</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showVariantModal && (
        <VariantSelectorDialog group={group} onClose={() => setShowVariantModal(false)} />
      )}
    </>
  );
}
