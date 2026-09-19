import { useState, useRef } from 'react';
import { Product } from '@/types';
import { uploadProductImage } from '@/lib/storageService';

interface ProductFormDialogProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
}

export default function ProductFormDialog({ product, onClose, onSave }: ProductFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || 'Staples',
    subcategory: product?.subcategory || '',
    weight: product?.weight || '',
    unit: product?.unit || 'kg',
    sellingPrice: product?.sellingPrice || 0,
    mrp: product?.mrp || 0,
    image: product?.image || '',
    stockStatus: product?.stockStatus || 'in_stock',
    stockQuantity: product?.stockQuantity || 100,
    description: product?.description || '',
    searchKeywords: product?.searchKeywords?.join(', ') || '',
    isActive: product !== undefined ? product.isActive : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadProductImage(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Ensure Firebase Storage is enabled and rules allow writes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const discount = formData.mrp > formData.sellingPrice 
        ? Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100) 
        : 0;

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await onSave({
        ...formData,
        stockStatus: formData.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
        discount,
        slug,
        searchKeywords: formData.searchKeywords.split(',').map(k => k.trim()).filter(Boolean)
      });
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200">
          <h2 className="text-xl font-bold text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Subcategory</label>
                <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                <input required type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">MRP (₹)</label>
                <input required type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Weight/Size</label>
                <input required type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g. 500, 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Unit</label>
                <input required type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g. gm, kg, L" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Product Image</label>
              
              <div className="flex items-center gap-4">
                {formData.image && (
                  <div className="w-16 h-16 shrink-0 rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden" 
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-sm font-bold text-slate-700 rounded-lg border border-stone-300 disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Upload from PC'}
                  </button>
                  <p className="text-xs text-slate-500 mt-1">Or paste a URL below</p>
                </div>
              </div>

              <input 
                type="text" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                className="w-full border-stone-300 rounded-lg p-2 text-sm mt-2" 
                placeholder="https://..." 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Search Keywords (comma separated)</label>
              <input type="text" name="searchKeywords" value={formData.searchKeywords} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-[#F98866] focus:ring-[#F98866] border-stone-300 rounded" />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active (Visible in store)</label>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-stone-200 rounded-lg">
            Cancel
          </button>
          <button form="product-form" type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2">
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
