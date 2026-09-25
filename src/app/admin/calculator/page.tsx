'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/productService';
import { ProductGroup } from '@/types';
import { groupProductsByName } from '@/lib/utils';
import LooseCalculator from '@/components/admin/LooseCalculator';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function CalculatorPage() {
  const [products, setProducts] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!isFirebaseConfigured()) {
          setIsLoading(false);
          return;
        }
        const fetched = await getProducts();
        const active = fetched.filter(p => p.isActive);
        const grouped = groupProductsByName(active);
        setProducts(grouped);
      } catch (err) {
        console.error('Failed to load products for calculator:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Loose Item Calculator</h1>
        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
          Quickly calculate prices and weights for loose products.
        </p>
      </div>
      
      <LooseCalculator products={products} />
    </div>
  );
}
