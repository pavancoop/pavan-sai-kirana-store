'use client';

import { useCart } from '@/context/CartContext';
import { storeConfig } from '@/config/store';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface HeaderProps {
  onCartClick: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  products?: Product[];
}

export default function Header({ onCartClick, onSearchChange, searchQuery, products = [] }: HeaderProps) {
  const { state, addItem, incrementItem, decrementItem, getItemQuantity } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRefDesktop = useRef<HTMLDivElement>(null);
  const searchRefMobile = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRefDesktop.current && !searchRefDesktop.current.contains(event.target as Node) &&
          searchRefMobile.current && !searchRefMobile.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.searchKeywords && p.searchKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())))
  ).slice(0, 5); // Show top 5 results

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#FFF2D7] text-[#2c2416] text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 px-3 sm:px-4 border-b border-[#fed7aa]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-flex items-center justify-center w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-emerald-800">⚡ 30 Min Delivery</span>
            <span className="truncate hidden sm:inline">• Target local area • Min. Order ₹200</span>
            <span className="truncate sm:hidden">• Min ₹200</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-[#c24b27]">
            <span>No Eggs or Fresh Produce Sold</span>
            <a
              href={`https://wa.me/${storeConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-emerald-800"
            >
              Direct WhatsApp: Support Active
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-3 md:gap-8">
          {/* Store Brand / Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-[#F98866] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base md:text-xl tracking-tight text-slate-900 leading-tight">PAVAN SAI KIRANA</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider text-[#e56b46] uppercase">General Store • 30m Delivery</span>
            </div>
          </a>

          {/* Desktop Search Bar */}
          <div ref={searchRefDesktop} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <svg className="absolute left-4 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search 'pesara pappu', 'rice', 'dal', 'oil', 'biscuit'..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-[#FFFDF9] border border-orange-200 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#F98866] focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => { onSearchChange(''); setShowDropdown(false); }}
                  className="absolute right-3.5 top-2.5 bg-slate-200 text-slate-600 rounded-full p-1 hover:bg-slate-300"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50">
                  {searchResults.map((product) => {
                    const quantity = getItemQuantity(product.id);
                    return (
                      <div key={product.id} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                            {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" /> : '🛒'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.weight} {product.unit} • {formatPrice(product.sellingPrice)}</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-2">
                          {quantity === 0 ? (
                            <button
                              onClick={() => addItem(product)}
                              className="px-3 py-1.5 bg-[#FFF2D7] text-[#c24b27] font-bold text-xs rounded-md hover:bg-[#F98866] hover:text-white transition-colors border border-[#fed7aa]"
                            >
                              ADD
                            </button>
                          ) : (
                            <div className="flex items-center bg-[#F98866] text-white rounded-md overflow-hidden shadow-sm h-7">
                              <button onClick={() => decrementItem(product.id)} className="px-2 font-bold hover:bg-[#e56b46] h-full">-</button>
                              <span className="px-2 text-xs font-extrabold bg-[#e56b46] h-full flex items-center">{quantity}</span>
                              <button onClick={() => addItem(product)} className="px-2 font-bold hover:bg-[#e56b46] h-full">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* WhatsApp Button (Desktop) */}
            <a
              href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeConfig.name}, I have an inquiry regarding grocery order.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>Order on WhatsApp</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-1.5 sm:gap-2 bg-[#F98866] hover:bg-[#e56b46] text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {state.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {state.totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-extrabold">
                {formatPrice(state.grandTotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Always visible */}
        <div ref={searchRefMobile} className="md:hidden px-3 pb-2 pt-1 border-t border-orange-50 bg-white relative">
          <div className="relative w-full">
            <svg className="absolute left-3 top-2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search groceries (e.g. pappu, rice, oil)..."
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full bg-[#FFFDF9] border border-orange-200 rounded-full py-2 pl-9 pr-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#F98866]"
            />
            {searchQuery && (
              <button
                onClick={() => { onSearchChange(''); setShowDropdown(false); }}
                className="absolute right-3 top-2.5 bg-slate-200 text-slate-600 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Mobile Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-orange-100 overflow-hidden z-50 mx-3 max-h-[60vh] overflow-y-auto">
                {searchResults.map((product) => {
                  const quantity = getItemQuantity(product.id);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-2.5 border-b border-slate-50 last:border-0 hover:bg-orange-50/50">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                          {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" /> : '🛒'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 truncate">{product.name}</p>
                          <p className="text-[11px] text-slate-500">{product.weight} {product.unit} • {formatPrice(product.sellingPrice)}</p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {quantity === 0 ? (
                          <button
                            onClick={() => addItem(product)}
                            className="px-2.5 py-1.5 bg-[#FFF2D7] text-[#c24b27] font-bold text-[11px] rounded-md hover:bg-[#F98866] hover:text-white border border-[#fed7aa]"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-[#F98866] text-white rounded-md overflow-hidden shadow-sm h-6">
                            <button onClick={() => decrementItem(product.id)} className="px-2 font-bold hover:bg-[#e56b46] h-full">-</button>
                            <span className="px-1 text-[11px] font-extrabold bg-[#e56b46] h-full flex items-center">{quantity}</span>
                            <button onClick={() => addItem(product)} className="px-2 font-bold hover:bg-[#e56b46] h-full">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
