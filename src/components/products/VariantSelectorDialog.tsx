'use client';

import { ProductGroup, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { resolveProductImage } from '@/lib/imageResolver';
import { useState, useEffect } from 'react';

interface VariantSelectorDialogProps {
  group: ProductGroup;
  onClose: () => void;
}

export default function VariantSelectorDialog({ group, onClose }: VariantSelectorDialogProps) {
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const resolvedImage = resolveProductImage(group);
  const allImages = [];
  if (resolvedImage.type === 'image') allImages.push(resolvedImage.src);
  if (group.additionalImages) allImages.push(...group.additionalImages);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full sm:w-[400px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 relative z-10 bg-white">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg line-clamp-1">{group.name}</h3>
            {group.brand && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.brand}</p>}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Gallery Carousel */}
        {allImages.length > 0 ? (
          <div className="w-full aspect-[4/3] bg-stone-50 relative border-b border-stone-100 flex-shrink-0 group overflow-hidden">
            <div 
              className="flex w-full h-full transition-transform duration-300 ease-out snap-x snap-mandatory overflow-x-auto scrollbar-hide"
              onScroll={(e) => {
                const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                const width = (e.target as HTMLDivElement).clientWidth;
                setActiveImageIndex(Math.round(scrollLeft / width));
              }}
            >
              {allImages.map((src, i) => (
                <div key={i} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-4">
                  <img src={src} alt={`${group.name} - ${i + 1}`} className="w-full h-full object-contain drop-shadow-sm" />
                </div>
              ))}
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                {allImages.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'bg-orange-500 w-3' : 'bg-stone-300'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-stone-50 flex flex-col items-center justify-center border-b border-stone-100 flex-shrink-0">
            <span className="text-6xl opacity-80 mb-2">{resolvedImage.src}</span>
          </div>
        )}

        {/* Variants List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {group.variants.map((product) => {
            const quantity = getItemQuantity(product.id);
            const isOutOfStock = product.stockStatus === 'out_of_stock';

            return (
              <div 
                key={product.id} 
                className={`flex items-center justify-between p-3 rounded-xl border ${quantity > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200'} transition-all`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">{product.weight} {String(product.weight).toLowerCase().includes(product.unit.toLowerCase()) ? '' : product.unit}</span>
                    {product.discount > 0 && (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-extrabold text-[#F98866]">{formatPrice(product.sellingPrice)}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatPrice(product.mrp)}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-[84px] flex justify-end">
                  {isOutOfStock ? (
                    <span className="text-[10px] font-extrabold text-red-500 uppercase">Out of Stock</span>
                  ) : quantity === 0 ? (
                    <button
                      onClick={() => addItem(product)}
                      className="w-[72px] h-8 bg-white border border-[#fed7aa] text-[#c24b27] font-extrabold text-xs rounded-lg shadow-sm hover:bg-orange-50 active:scale-95 transition-all"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="w-[84px] h-8 flex items-center justify-between bg-[#F98866] text-white rounded-lg shadow-sm overflow-hidden font-bold">
                      <button 
                        onClick={() => decrementItem(product.id)} 
                        className="w-8 h-full flex items-center justify-center hover:bg-[#e56b46] active:bg-[#d45a36] transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs w-5 text-center">{quantity}</span>
                      <button 
                        onClick={() => addItem(product)} 
                        className="w-8 h-full flex items-center justify-center hover:bg-[#e56b46] active:bg-[#d45a36] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
