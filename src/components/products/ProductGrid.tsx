import { ProductGroup } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ProductGroup[];
  title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-10 text-center bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
        <div className="text-4xl">🔍</div>
        <h3 className="text-base font-bold text-slate-800">No matching groceries found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We couldn&apos;t find items matching your search. Try searching for common staples like &ldquo;pesara&rdquo;, &ldquo;pappu&rdquo;, &ldquo;dal&rdquo;, &ldquo;oil&rdquo;, or &ldquo;rice&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
