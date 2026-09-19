'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types';

export function useProductSearch(
  products: Product[],
  searchQuery: string,
  selectedCategory: string | null
) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let results = products.filter(p => p.isActive);

    // Category filter
    if (selectedCategory) {
      results = results.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      results = results.filter(product => {
        const searchableFields = [
          product.name,
          product.brand,
          product.category,
          product.subcategory,
          product.weight,
          product.description,
          ...product.searchKeywords,
        ].map(f => f.toLowerCase());

        return searchableFields.some(field => field.includes(query));
      });
    }

    return results;
  }, [products, debouncedQuery, selectedCategory]);

  return {
    results: filteredProducts,
    isSearching: searchQuery !== debouncedQuery,
    hasQuery: debouncedQuery.trim().length > 0,
    resultCount: filteredProducts.length,
  };
}
