'use client';

import { categories } from '@/data/categories';

interface CategoryShowcaseProps {
  onCategoryClick: (categoryId: string) => void;
}

export default function CategoryShowcase({ onCategoryClick }: CategoryShowcaseProps) {
  const activeCategories = categories
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900">Shop by Category</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Browse authentic staples & snacks</p>
        </div>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 md:grid-cols-7 sm:gap-3">
        {activeCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 md:p-4 bg-white rounded-lg sm:rounded-xl border border-orange-100/80 hover:border-[#F98866]/30 hover:shadow-sm transition-all active:scale-[0.97] group shrink-0 w-[68px] sm:w-auto"
          >
            <span className="text-xl sm:text-2xl md:text-3xl group-hover:scale-110 transition-transform">
              {category.icon}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
