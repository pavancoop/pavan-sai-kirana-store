import { useState, useRef } from 'react';
import { Product } from '@/types';
import { uploadProductImage, validateImageUrl, deleteProductImage } from '@/lib/imageService';

interface ProductFormDialogProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
}

export default function ProductFormDialog({ product, onClose, onSave }: ProductFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
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
    image: product?.image || '', // Legacy
    imageUrl: product?.imageUrl || product?.image || '',
    imageSource: product?.imageSource || (product?.image ? 'FIREBASE' : 'GENERATED'),
    imageStatus: product?.imageStatus || (product?.image ? 'REAL_IMAGE' : 'GENERATED_PLACEHOLDER'),
    additionalImages: product?.additionalImages || [],
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
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: url, 
        image: url, // Sync legacy
        imageSource: 'CLOUDINARY',
        imageStatus: 'REAL_IMAGE' 
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      imageUrl: url,
      image: url, // Sync legacy
      imageSource: url ? 'EXTERNAL_URL' : 'GENERATED',
      imageStatus: url ? 'REAL_IMAGE' : 'GENERATED_PLACEHOLDER'
    }));
  };

  const handleRemoveImage = () => {
    // Optionally call deleteProductImage(formData.imageUrl) here if we wanted to eagerly delete.
    // For safety, we just unlink it.
    setFormData(prev => ({ 
      ...prev, 
      imageUrl: '',
      image: '',
      imageSource: 'GENERATED',
      imageStatus: 'GENERATED_PLACEHOLDER' 
    }));
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadProductImage(file);
      setFormData(prev => ({ 
        ...prev, 
        additionalImages: [...prev.additionalImages, url]
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to upload additional image.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
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
        imageUpdatedAt: Date.now(), // update timestamp for caching
        additionalImages: formData.additionalImages,
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
                <select required name="category" value={formData.category} onChange={handleChange} className="w-full border-stone-300 rounded-lg p-2 text-sm bg-white">
                  <option value="">Select Category</option>
                  <option value="rice-grains">Rice & Grains</option>
                  <option value="dal-pulses">Dal & Pulses</option>
                  <option value="oils">Oils</option>
                  <option value="fresh-produce">Fresh Produce</option>
                  <option value="spices-masalas">Spices & Masalas</option>
                  <option value="pooja-religious">Pooja & Religious</option>
                  <option value="biscuits-snacks">Biscuits & Snacks</option>
                  <option value="beverages">Beverages</option>
                  <option value="tea-coffee">Tea & Coffee</option>
                  <option value="breakfast-items">Breakfast Items</option>
                  <option value="packaged-foods">Packaged Foods</option>
                  <option value="personal-care">Personal Care</option>
                  <option value="household">Household</option>
                  <option value="cleaning-products">Cleaning Products</option>
                  <option value="baby-products">Baby Products</option>
                  <option value="other">Other</option>
                </select>
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

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-4">
              <label className="block text-sm font-bold text-slate-900">Product Image</label>
              
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Preview Area */}
                <div className="w-full sm:w-40 aspect-square shrink-0 rounded-xl border border-stone-200 overflow-hidden bg-white flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl opacity-50">📷</span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Status:</span>
                    {formData.imageStatus === 'REAL_IMAGE' ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        ✓ Real Image
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                        ⚠ Generated Placeholder
                      </span>
                    )}
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex bg-stone-200/50 p-1 rounded-lg">
                    <button 
                      type="button" 
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${imageMode === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Upload from PC
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setImageMode('url')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${imageMode === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Image URL
                    </button>
                  </div>

                  {/* Inputs */}
                  {imageMode === 'upload' ? (
                    <div>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-2 bg-white hover:bg-stone-50 text-sm font-bold text-slate-700 rounded-lg border border-stone-300 disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </button>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={formData.imageUrl} 
                      onChange={handleUrlPaste} 
                      className="w-full border-stone-300 rounded-lg p-2 text-sm" 
                      placeholder="https://..." 
                    />
                  )}

                  {/* Actions */}
                  {formData.imageUrl && (
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Images Gallery */}
              <div className="pt-4 border-t border-stone-200 mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Images Gallery (Optional)</label>
                <div className="flex flex-wrap gap-3">
                  {formData.additionalImages.map((img, index) => (
                    <div key={index} className="w-20 h-20 relative rounded-lg border border-stone-200 overflow-hidden bg-white group">
                      <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {formData.additionalImages.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 flex flex-col items-center justify-center cursor-pointer transition-colors text-stone-500">
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleAdditionalImageUpload}
                        disabled={isUploading}
                        className="hidden" 
                      />
                      <span className="text-xl leading-none mb-1">+</span>
                      <span className="text-[10px] font-bold">Add</span>
                    </label>
                  )}
                </div>
              </div>
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
