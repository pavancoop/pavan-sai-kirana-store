'use client';

import { ProductGroup } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { resolveProductImage } from '@/lib/imageResolver';
import { useState, useEffect, useRef } from 'react';

interface VariantSelectorDialogProps {
  group: ProductGroup;
  initialVariantId?: string;
  onClose: () => void;
}

export default function VariantSelectorDialog({ group, initialVariantId, onClose }: VariantSelectorDialogProps) {
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Initialize local quantities state
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>(() => {
    const qtys: Record<string, number> = {};
    group.variants.forEach(v => {
      qtys[v.id] = getItemQuantity(v.id);
    });
    // Add 1 to the initial variant if it was just clicked
    if (initialVariantId) {
      qtys[initialVariantId] = (qtys[initialVariantId] || 0) + 1;
    }
    return qtys;
  });

  // Auto-scroll images
  useEffect(() => {
    const numImages = group.additionalImages ? group.additionalImages.length + 1 : 1;
    if (numImages <= 1) return;
    
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
        const nextScrollLeft = scrollLeft + clientWidth;
        if (nextScrollLeft >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [group.additionalImages]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const resolvedImage = resolveProductImage(group);
  const allImages = [];
  if (resolvedImage.type === 'image') allImages.push(resolvedImage.src);
  if (group.additionalImages) allImages.push(...group.additionalImages);

  const handleLocalIncrement = (variantId: string) => {
    setLocalQuantities(prev => ({
      ...prev,
      [variantId]: (prev[variantId] || 0) + 1
    }));
  };

  const handleLocalDecrement = (variantId: string) => {
    setLocalQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(0, (prev[variantId] || 0) - 1)
    }));
  };

  const handleConfirm = () => {
    // Sync local quantities with global cart
    group.variants.forEach(v => {
      const globalQty = getItemQuantity(v.id);
      const localQty = localQuantities[v.id] || 0;
      const diff = localQty - globalQty;
      
      if (diff > 0) {
        // We use addItem for the first addition (which pushes to cart array)
        // For remaining additions we can use incrementItem
        for (let i = 0; i < diff; i++) {
          if (globalQty + i === 0) {
            addItem(v);
          } else {
            incrementItem(v.id);
          }
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) decrementItem(v.id);
      }
    });
    onClose();
  };

  // Calculate totals for the sticky footer
  const localTotalItems = group.variants.reduce((sum, v) => sum + (localQuantities[v.id] || 0), 0);
  const localTotalPrice = group.variants.reduce((sum, v) => sum + ((localQuantities[v.id] || 0) * v.sellingPrice), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full sm:w-[480px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
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
              ref={carouselRef}
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
        <div className="flex-1 overflow-y-auto p-2 pb-[110px] sm:p-4 sm:pb-[110px]">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {group.variants.map((product) => {
              const quantity = localQuantities[product.id] || 0;
              const isOutOfStock = product.stockStatus === 'out_of_stock';

              return (
                <div 
                  key={product.id} 
                  className={`flex flex-col p-2.5 rounded-xl border ${quantity > 0 ? 'border-[#F98866] bg-orange-50/40 shadow-sm' : 'border-stone-200 bg-white hover:border-orange-200'} transition-all`}
                >
                  <div className="flex flex-col items-start gap-1 mb-1.5">
                    <span className="font-extrabold text-slate-800 text-[13px] leading-none pt-0.5">{product.weight} {String(product.weight).toLowerCase().includes(product.unit.toLowerCase()) ? '' : product.unit}</span>
                    {product.discount > 0 && (
                      <span className="text-[8px] font-extrabold bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded flex-shrink-0">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start gap-0.5 mb-2.5">
                    <span className="font-black text-[#c24b27] text-sm leading-none">{formatPrice(product.sellingPrice)}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-[9px] text-slate-400 line-through leading-none">{formatPrice(product.mrp)}</span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isOutOfStock ? (
                      <div className="w-full h-7 flex items-center justify-center bg-stone-100 text-stone-400 font-bold text-[10px] rounded-lg uppercase tracking-wider">Out</div>
                    ) : quantity === 0 ? (
                      <button
                        onClick={() => handleLocalIncrement(product.id)}
                        className="w-full h-7 bg-[#FFF2D7] border border-[#fed7aa] text-[#c24b27] font-extrabold text-[11px] rounded-lg shadow-sm hover:bg-[#F98866] hover:text-white transition-colors"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="w-full h-7 flex items-center justify-between bg-[#F98866] text-white rounded-lg shadow-sm font-bold">
                        <button 
                          onClick={() => handleLocalDecrement(product.id)} 
                          className="w-[30%] h-full flex items-center justify-center hover:bg-[#e56b46] active:bg-[#d45a36] rounded-l-lg transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="text-[11px] text-center flex-1">{quantity}</span>
                        <button 
                          onClick={() => handleLocalIncrement(product.id)} 
                          className="w-[30%] h-full flex items-center justify-center hover:bg-[#e56b46] active:bg-[#d45a36] rounded-r-lg transition-colors text-sm"
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
        
        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 bg-[#F98866] text-white hover:bg-[#e56b46] shadow-md transition-all active:scale-95"
          >
            {localTotalItems > 0 ? (
              <>
                <span>Add {localTotalItems} item{localTotalItems > 1 ? 's' : ''}</span>
                <span className="opacity-50">•</span>
                <span>Total {formatPrice(localTotalPrice)}</span>
              </>
            ) : (
              <span>Close</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
