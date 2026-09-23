'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product, ProductGroup } from '@/types';
import { groupProductsByName } from '@/lib/utils';

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

  const filteredGroups = useMemo(() => {
    // 1. Filter flat products by active and category first
    let activeProducts = products.filter(p => p.isActive);
    if (selectedCategory) {
      activeProducts = activeProducts.filter(p => p.category === selectedCategory);
    }

    // 2. Group them by name
    let grouped = groupProductsByName(activeProducts);

    // 3. Search filter across grouped products
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      grouped = grouped.filter(group => {
        // Match group name or brand
        if (group.name.toLowerCase().includes(query)) return true;
        if (group.brand.toLowerCase().includes(query)) return true;
        
        // Match any variant's keywords, description, etc
        return group.variants.some(product => {
          const searchableFields = [
            product.category,
            product.subcategory,
            product.weight,
            product.description,
            ...product.searchKeywords,
          ].map(f => (f || '').toLowerCase());

          return searchableFields.some(field => field.includes(query));
        });
      });
    }

    return grouped;
  }, [debouncedQuery, selectedCategory, products]);

  return {
    results: filteredGroups,
    isSearching: debouncedQuery !== searchQuery,
    hasQuery: debouncedQuery.trim().length > 0,
    resultCount: filteredGroups.length
  };
}
