'use client';

import { useEffect, useState, useRef } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, seedDemoProducts } from '@/lib/productService';
import { parseAndImportCSV, CSV_HEADERS } from '@/lib/importService';
import { Product } from '@/types';
import { isFirebaseConfigured } from '@/lib/firebase';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);
  
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      if (!isFirebaseConfigured()) {
        setFirebaseConfigured(false);
        setIsLoading(false);
        return;
      }
      const fetched = await getProducts();
      setProducts(fetched);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not load products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSeed = async () => {
    if (!confirm('Load demo products into the database?')) return;
    setIsSeeding(true);
    try {
      await seedDemoProducts();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to load demo products');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await parseAndImportCSV(file);
      if (result.success) {
        alert(`Successfully imported ${result.importedCount} products!`);
      } else {
        alert(`Import partially failed.\nImported: ${result.importedCount}\nErrors: ${result.errors.length}\nCheck console for details.`);
        console.error('Import errors:', result.errors);
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('A critical error occurred during import.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = CSV_HEADERS.join(',') + '\n' +
      '"Apple","Fresh","Fruits","","120","150","1","kg","","apple, fresh, fruit","true"';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setIsFormOpen(false);
    setEditingProduct(undefined);
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  if (!firebaseConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage store inventory</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-900 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold">Firebase Not Configured</h2>
          <p className="mt-2 text-sm max-w-md mx-auto">
            The Admin Dashboard requires a real Firebase connection to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your catalog and inventory</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchProducts}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-stone-200 text-sm font-bold text-slate-700 rounded-lg hover:bg-stone-50 shadow-sm disabled:opacity-50"
          >
            Refresh
          </button>
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button 
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-stone-100 text-stone-700 border border-stone-300 text-sm font-bold rounded-lg hover:bg-stone-200 shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {isImporting ? 'Importing...' : 'Import CSV'}
            </button>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            
            <button 
              onClick={downloadTemplate} 
              className="text-xs font-bold text-slate-500 hover:text-[#F98866] underline decoration-stone-300 hover:decoration-[#F98866] underline-offset-4"
            >
              Download Template
            </button>
          </div>

          {products.length === 0 && !isLoading && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-lg hover:bg-amber-200 shadow-sm"
            >
              {isSeeding ? 'Loading...' : 'Load Demo Data'}
            </button>
          )}
          <button 
            onClick={() => {
              setEditingProduct(undefined);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-[#F98866] text-white text-sm font-bold rounded-lg hover:bg-[#e56b46] shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-xl text-red-800 text-sm">{error}</div>
      ) : isLoading && products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-slate-500">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-bold text-slate-800">No Products Yet</h3>
          <p className="text-slate-500 mt-1">Add your first product or load demo data.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 text-slate-500 border-b border-stone-200">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-right">Price</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.weight} {product.unit}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-stone-100 rounded text-xs">{product.category}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatPrice(product.sellingPrice)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                        {product.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ProductFormDialog 
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
