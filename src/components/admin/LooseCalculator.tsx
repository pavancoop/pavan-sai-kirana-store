'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductGroup, Product } from '@/types';
import { formatPrice, formatPriceDecimal } from '@/lib/utils';

interface LooseCalculatorProps {
  products: ProductGroup[];
}

export default function LooseCalculator({ products }: LooseCalculatorProps) {
  const looseProducts = useMemo(() => {
    return products.filter(p => p.sellingMode === 'LOOSE');
  }, [products]);

  const packagedProducts = useMemo(() => {
    return products.filter(p => p.sellingMode !== 'LOOSE');
  }, [products]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [showPackaged, setShowPackaged] = useState(true);

  // Load last selected from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('psk_last_calculator_product');
    if (saved && products.length > 0) {
      const group = products.find(p => p.id === saved);
      if (group) {
        setSelectedGroup(group);
        setSelectedVariant(group.variants[0]);
      }
    }
  }, [products]);

  const handleSelectGroup = (group: ProductGroup) => {
    setSelectedGroup(group);
    setSelectedVariant(group.variants[0]);
    setIsDropdownOpen(false);
    setSearchQuery('');
    sessionStorage.setItem('psk_last_calculator_product', group.id);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const targetList = showPackaged ? products : looseProducts;
    const query = searchQuery.toLowerCase().trim();
    return targetList.filter(group => {
      if (group.name.toLowerCase().includes(query)) return true;
      if (group.brand.toLowerCase().includes(query)) return true;
      return false;
    }).slice(0, 15);
  }, [searchQuery, looseProducts, products, showPackaged]);

  const getPricePerGram = (variant: Product | null) => {
    if (!variant) return 0;
    const weightVal = parseFloat(variant.weight);
    if (isNaN(weightVal)) return 0;

    const unit = variant.unit.toLowerCase();
    let weightInGrams = weightVal;
    if (unit === 'kg' || unit === 'l' || unit === 'liter' || unit === 'litres') {
      weightInGrams = weightVal * 1000;
    }
    return variant.sellingPrice / weightInGrams;
  };

  const pricePerGram = getPricePerGram(selectedVariant);
  const currentPricePerKg = pricePerGram * 1000;

  const [mode, setMode] = useState<'WEIGHT_TO_PRICE' | 'AMOUNT_TO_WEIGHT'>('WEIGHT_TO_PRICE');
  const [amountInput, setAmountInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [weightUnit, setWeightUnit] = useState<'g' | 'kg'>('g');
  
  const [rounding, setRounding] = useState<'EXACT' | '1' | '5' | '10'>('EXACT');

  // Calculations
  let resultPrice = 0;
  let resultWeightGrams = 0;

  if (selectedVariant && pricePerGram > 0) {
    if (mode === 'AMOUNT_TO_WEIGHT') {
      const amt = parseFloat(amountInput) || 0;
      resultWeightGrams = amt / pricePerGram;
    } else {
      let w = parseFloat(weightInput) || 0;
      if (weightUnit === 'kg') w *= 1000;
      resultPrice = w * pricePerGram;
    }
  }

  const getRoundedWeight = (exact: number) => {
    if (rounding === 'EXACT') return exact;
    const roundVal = parseInt(rounding);
    return Math.round(exact / roundVal) * roundVal;
  };

  const formatWeightDisplay = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(3).replace(/\.?0+$/, '')} kg`;
    }
    return `${grams.toFixed(1).replace(/\.?0+$/, '')} g`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden flex flex-col h-[calc(100vh-100px)] md:h-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-orange-100 flex items-center gap-3 bg-[#FFF2D7]/60 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#F98866] text-white flex items-center justify-center font-bold text-xl shadow-sm">
          🧮
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Calculator</h3>
          <p className="text-[11px] text-[#c24b27] font-bold">Quick loose item conversions</p>
        </div>
      </div>

      {/* Product Selection */}
      <div className="p-4 sm:p-5 space-y-4 bg-stone-50 border-b border-stone-200 shrink-0 relative z-20">
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-bold text-slate-700">Select Product</label>
            <button 
              onClick={() => setShowPackaged(!showPackaged)}
              className="text-[10px] font-bold text-slate-500 hover:text-orange-500"
            >
              {showPackaged ? 'Hide Packaged' : 'Include Packaged'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Search for Palli, Sugar, Dal..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full border-stone-300 rounded-xl p-3 pl-10 text-sm font-bold shadow-inner focus:ring-[#F98866] focus:border-[#F98866]"
          />
          <svg className="absolute left-3.5 top-9 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-stone-200 shadow-2xl rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className="w-full text-left p-3 border-b border-stone-50 hover:bg-orange-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-bold text-sm text-slate-800">{group.name}</span>
                  {group.sellingMode !== 'LOOSE' && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Packaged</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGroup && selectedVariant && (
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10" />
            <h4 className="font-extrabold text-slate-900 line-clamp-1">{selectedGroup.name}</h4>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">{formatPrice(currentPricePerKg)}</span>
              <span className="text-sm font-bold text-slate-500 mb-1">/ kg</span>
            </div>
            
            {/* Base variant selector if multiple exist */}
            {selectedGroup.variants.length > 1 && (
              <div className="mt-3 grid grid-cols-2 gap-2 pb-1">
                {selectedGroup.variants.map(v => {
                  const weightDisplay = v.weight.toString().toLowerCase().includes(v.unit.toLowerCase()) 
                    ? v.weight 
                    : `${v.weight} ${v.unit}`;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        selectedVariant.id === v.id 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-stone-200 text-slate-600 hover:border-emerald-200'
                      }`}
                    >
                      Based on {weightDisplay} ({formatPrice(v.sellingPrice)})
                    </button>
                  );
                })}
              </div>
            )}
            
            {selectedGroup.sellingMode !== 'LOOSE' && (
              <p className="text-[10px] text-amber-600 mt-2 font-bold bg-amber-50 px-2 py-1 rounded inline-block">
                ⚠️ This is a packaged item. Calculations may not apply.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-stone-100 p-1 mx-4 sm:mx-5 mt-4 sm:mt-5 rounded-xl shrink-0">
        <button
          onClick={() => setMode('WEIGHT_TO_PRICE')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${mode === 'WEIGHT_TO_PRICE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Target Weight (g/kg)
        </button>
        <button
          onClick={() => setMode('AMOUNT_TO_WEIGHT')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${mode === 'AMOUNT_TO_WEIGHT' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Customer Amount (₹)
        </button>
      </div>

      {/* Main Calculation Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col min-h-0">
        {!selectedVariant ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 border-2 border-dashed border-stone-200 rounded-2xl">
            <div>
              <div className="text-4xl mb-2 opacity-50">👆</div>
              <p className="text-sm font-bold text-slate-500">Search and select a loose product to begin calculating.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            
            {/* Input Area */}
            {mode === 'AMOUNT_TO_WEIGHT' ? (
              <div className="space-y-4 shrink-0">
                <label className="block text-center text-sm font-bold text-slate-500">Customer wants:</label>
                <div className="relative max-w-[200px] mx-auto">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full text-center text-4xl font-extrabold py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:border-[#F98866] focus:ring-0 transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {/* Quick Buttons */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Suggested Amounts</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 20, 30, 50, 100].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setAmountInput(amt.toString())}
                        className="py-2.5 bg-stone-100 hover:bg-[#FFF2D7] hover:text-[#c24b27] text-slate-700 font-extrabold rounded-xl transition-colors border border-transparent hover:border-[#fed7aa] shadow-sm text-sm"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 shrink-0">
                <label className="block text-center text-sm font-bold text-slate-500">Required weight:</label>
                <div className="flex items-center justify-center gap-2 max-w-[240px] mx-auto">
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-2/3 text-center text-4xl font-extrabold py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:border-[#F98866] focus:ring-0 transition-colors"
                    placeholder="0"
                    min="0"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'g'|'kg')}
                    className="w-1/3 py-4 text-center font-extrabold bg-stone-100 border-2 border-stone-200 rounded-2xl focus:border-[#F98866]"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>

                {/* Quick Buttons */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Suggested Weights</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '50 g', w: '50', u: 'g' },
                      { label: '100 g', w: '100', u: 'g' },
                      { label: '250 g', w: '250', u: 'g' },
                      { label: '500 g', w: '500', u: 'g' },
                      { label: '750 g', w: '750', u: 'g' },
                      { label: '1 kg', w: '1', u: 'kg' },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={() => { setWeightInput(btn.w); setWeightUnit(btn.u as 'g'|'kg'); }}
                        className="py-2.5 bg-stone-100 hover:bg-[#FFF2D7] hover:text-[#c24b27] text-slate-700 font-extrabold rounded-xl transition-colors border border-transparent hover:border-[#fed7aa] shadow-sm text-sm"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Area */}
            <div className="mt-auto pt-6 pb-2">
              <div className="bg-[#FFFDF9] border-2 border-[#F98866] rounded-3xl p-5 sm:p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFF2D7] rounded-full opacity-50 blur-xl"></div>
                
                {mode === 'AMOUNT_TO_WEIGHT' ? (
                  <>
                    <p className="text-sm font-extrabold text-[#c24b27] mb-2 uppercase tracking-wider">Give Customer</p>
                    <div className="text-5xl font-black text-slate-900 tracking-tight">
                      {amountInput && parseFloat(amountInput) > 0 ? formatWeightDisplay(resultWeightGrams) : '0 g'}
                    </div>
                    
                    {amountInput && parseFloat(amountInput) > 0 && rounding !== 'EXACT' && (
                      <div className="mt-3 inline-block bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                        <span className="text-xs font-bold text-slate-500">Exact mathematical result: </span>
                        <span className="text-xs font-extrabold text-slate-800">{formatWeightDisplay(resultWeightGrams)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-extrabold text-[#c24b27] mb-2 uppercase tracking-wider">Total Price</p>
                    <div className="text-5xl font-black text-slate-900 tracking-tight">
                      {weightInput && parseFloat(weightInput) > 0 ? formatPriceDecimal(resultPrice) : '₹0.00'}
                    </div>
                  </>
                )}
              </div>

              {/* Rounding settings (only relevant for Amount->Weight) */}
              {mode === 'AMOUNT_TO_WEIGHT' && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Scale Rounding:</span>
                  <select 
                    value={rounding} 
                    onChange={(e) => setRounding(e.target.value as any)}
                    className="text-xs font-bold bg-transparent border-none text-slate-600 focus:ring-0 p-0 cursor-pointer hover:text-slate-900"
                  >
                    <option value="EXACT">Exact (No Rounding)</option>
                    <option value="1">Nearest 1 g</option>
                    <option value="5">Nearest 5 g</option>
                    <option value="10">Nearest 10 g</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
