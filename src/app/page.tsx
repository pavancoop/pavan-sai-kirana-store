'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import HowItWorks from '@/components/home/HowItWorks';
import PromoSection from '@/components/home/PromoSection';
import ProductGrid from '@/components/products/ProductGrid';
import CategoryFilter from '@/components/products/CategoryFilter';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useCart } from '@/context/CartContext';
import { CheckoutFormData, Order, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { storeConfig } from '@/config/store';
import { getProducts } from '@/lib/productService';

type PageView = 'home' | 'checkout' | 'confirmation';

export default function Home() {
  const [pageView, setPageView] = useState<PageView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts.filter(p => p.isActive));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const { results, isSearching, hasQuery, resultCount } = useProductSearch(
    products,
    searchQuery,
    selectedCategory
  );

  const { state, clearCart, isMinimumMet, amountToMinimum } = useCart();

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollToProducts();
  };

  const handlePlaceOrder = (order: Order) => {
    setConfirmedOrder(order);
    clearCart();
    setPageView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueShopping = () => {
    setConfirmedOrder(null);
    setPageView('home');
    setSearchQuery('');
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout view
  if (pageView === 'checkout') {
    return (
      <>
        <Header
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          <CheckoutForm
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setPageView('home')}
          />
        </main>
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => setPageView('checkout')}
        />
      </>
    );
  }

  // Order confirmation view
  if (pageView === 'confirmation' && confirmedOrder) {
    return (
      <>
        <Header
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <OrderConfirmation
            order={confirmedOrder}
            onContinueShopping={handleContinueShopping}
          />
        </main>
      </>
    );
  }

  // Home / shopping view
  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Hero Section */}
        <HeroSection onShopNow={scrollToProducts} />

        {/* Demo Data Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 flex items-start gap-2 sm:gap-3 text-[11px] sm:text-sm text-amber-900">
          <span className="text-sm sm:text-lg">📢</span>
          <div className="flex-1">
            <span className="font-bold">Demo Mode:</span>{' '}
            <span className="hidden sm:inline">Currently displaying initial demo items (approx. 441 products import-ready). All prices &amp; stocks shown are representative prototype data. No eggs or fresh produce.</span>
            <span className="sm:hidden">Displaying demo items. Prices are representative prototype data.</span>
          </div>
        </div>

        {/* Category Showcase */}
        <CategoryShowcase onCategoryClick={handleCategoryClick} />

        {/* Product Catalog */}
        <section id="product-catalog" ref={productsRef} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {hasQuery ? 'Search Results' : selectedCategory ? 'Products' : 'Popular Staples'}
                </h2>
                {!isLoadingProducts && (
                  <span className="bg-orange-100 text-[#c24b27] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {resultCount} Product{resultCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasQuery ? `Found items for "${searchQuery}"` : 'Everyday quality groceries at local prices'}
              </p>
            </div>
            {!hasQuery && !isLoadingProducts && (
              <CategoryFilter 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
            )}
          </div>

          {isLoadingProducts ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#F98866] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading products...</p>
            </div>
          ) : results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                We couldn't find any products matching your current search or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#FFF2D7] text-[#c24b27] font-bold text-sm hover:bg-orange-200 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* WhatsApp Direct Order Section */}
        <PromoSection onShopNow={scrollToProducts} />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setPageView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Sticky Mobile Bottom Cart Bar */}
      {state.totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-orange-200 p-3 shadow-2xl z-30 md:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF2D7] text-[#F98866] flex items-center justify-center font-extrabold text-sm relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {state.totalItems}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">Cart Total</div>
              <div className="text-sm font-extrabold text-slate-900">{formatPrice(state.grandTotal)}</div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#F98866] text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95"
          >
            <span>
              {!isMinimumMet
                ? `Add ${formatPrice(amountToMinimum)} more`
                : 'View Cart'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
