'use client';

import { categories } from '@/data/categories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
          selectedCategory === null
            ? 'bg-[#F98866] text-white shadow-sm ring-2 ring-[#F98866]/30'
            : 'bg-white text-stone-700 hover:bg-orange-50 border border-orange-100/80'
        }`}
      >
        <span>🏪</span>
        <span>All</span>
      </button>
      {categories
        .filter(c => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id === selectedCategory ? null : category.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === category.id
                ? 'bg-[#F98866] text-white shadow-sm ring-2 ring-[#F98866]/30'
                : 'bg-white text-stone-700 hover:bg-orange-50 border border-orange-100/80'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
    </div>
  );
}
