import { useState, useRef } from 'react';
import { Product, ProductGroup } from '@/types';
import { uploadProductImage } from '@/lib/imageService';
import { categories } from '@/data/categories';

interface ProductFormDialogGroupProps {
  group?: ProductGroup;
  onClose: () => void;
  onSave: (baseDetails: Partial<Product>, variants: Product[], deletedIds: string[]) => Promise<void>;
}

export default function ProductFormDialog({ group, onClose, onSave }: ProductFormDialogGroupProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Base details that apply to the whole group
  const [baseData, setBaseData] = useState({
    name: group?.name || '',
    brand: group?.brand || '',
    category: group?.category || 'Staples',
    subcategory: group?.variants?.[0]?.subcategory || '',
    image: group?.image || '', 
    imageUrl: group?.imageUrl || group?.image || '',
    imageSource: group?.imageSource || (group?.image ? 'FIREBASE' : 'GENERATED'),
    imageStatus: group?.imageStatus || (group?.image ? 'REAL_IMAGE' : 'GENERATED_PLACEHOLDER'),
    additionalImages: group?.additionalImages || [],
    description: group?.variants?.[0]?.description || '',
    searchKeywords: group?.variants?.[0]?.searchKeywords?.join(', ') || '',
  });

  // The individual variants
  const [variants, setVariants] = useState<Partial<Product>[]>(
    group?.variants || [
      {
        id: 'new_' + Date.now(),
        weight: '',
        unit: 'kg',
        mrp: 0,
        sellingPrice: 0,
        stockStatus: 'in_stock',
        stockQuantity: 100,
        isActive: true,
      }
    ]
  );
  
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: 'new_' + Date.now(),
        weight: '',
        unit: 'kg',
        mrp: 0,
        sellingPrice: 0,
        stockStatus: 'in_stock',
        stockQuantity: 100,
        isActive: true,
      }
    ]);
  };

  const removeVariant = (index: number) => {
    const variant = variants[index];
    if (variant.id && !variant.id.startsWith('new_')) {
      setDeletedIds(prev => [...prev, variant.id!]);
    }
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadProductImage(file);
      setBaseData(prev => ({ 
        ...prev, 
        imageUrl: url, 
        image: url,
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
    setBaseData(prev => ({ 
      ...prev, 
      imageUrl: url,
      image: url,
      imageSource: url ? 'EXTERNAL_URL' : 'GENERATED',
      imageStatus: url ? 'REAL_IMAGE' : 'GENERATED_PLACEHOLDER'
    }));
  };

  const handleRemoveImage = () => {
    setBaseData(prev => ({ 
      ...prev, imageUrl: '', image: '', imageSource: 'GENERATED', imageStatus: 'GENERATED_PLACEHOLDER' 
    }));
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadProductImage(file);
      setBaseData(prev => ({ 
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
    setBaseData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const slug = baseData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const searchKeywords = baseData.searchKeywords.split(',').map(k => k.trim()).filter(Boolean);

      // Process variants
      const finalVariants = variants.map(v => {
        const mrp = Number(v.mrp) || 0;
        const sellingPrice = Number(v.sellingPrice) || 0;
        const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
        return {
          ...v,
          mrp,
          sellingPrice,
          discount,
          stockQuantity: Number(v.stockQuantity) || 0,
        } as Product;
      });

      const finalBaseDetails: Partial<Product> = {
        name: baseData.name,
        brand: baseData.brand,
        category: baseData.category,
        subcategory: baseData.subcategory,
        image: baseData.image,
        imageUrl: baseData.imageUrl,
        imageSource: baseData.imageSource,
        imageStatus: baseData.imageStatus,
        additionalImages: baseData.additionalImages,
        description: baseData.description,
        searchKeywords,
        slug,
        imageUpdatedAt: Date.now(),
      };

      await onSave(finalBaseDetails, finalVariants, deletedIds);
    } catch (err) {
      console.error('Failed to save product group', err);
      alert('Failed to save product group');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            {group ? 'Edit Product Group' : 'Add New Product Group'}
          </h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Base Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                  <input type="text" name="name" value={baseData.name} onChange={handleBaseChange} required className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g., Kurnool Sona Masoori Rice" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Brand</label>
                  <input type="text" name="brand" value={baseData.brand} onChange={handleBaseChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g., Local Brand" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <select name="category" value={baseData.category} onChange={handleBaseChange} required className="w-full border-stone-300 rounded-lg p-2 text-sm">
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subcategory</label>
                  <input type="text" name="subcategory" value={baseData.subcategory} onChange={handleBaseChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g., Rice" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Search Keywords (comma separated)</label>
                  <input type="text" name="searchKeywords" value={baseData.searchKeywords} onChange={handleBaseChange} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="e.g., rice, sona masoori, kurnool" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Images</h3>
              <div className="flex gap-4">
                <div className="w-32 h-32 shrink-0 bg-stone-50 rounded-xl border border-stone-200 overflow-hidden flex flex-col items-center justify-center relative">
                  {baseData.imageUrl ? (
                    <img src={baseData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${imageMode === 'upload' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Upload</button>
                    <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${imageMode === 'url' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>URL</button>
                  </div>
                  {imageMode === 'upload' ? (
                    <div>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-2 bg-white text-sm font-bold border rounded-lg">{isUploading ? 'Uploading...' : 'Choose File'}</button>
                    </div>
                  ) : (
                    <input type="text" value={baseData.imageUrl} onChange={handleUrlPaste} className="w-full border-stone-300 rounded-lg p-2 text-sm" placeholder="https://..." />
                  )}
                  {baseData.imageUrl && (
                    <button type="button" onClick={handleRemoveImage} className="text-xs font-bold text-red-600 underline">Remove Image</button>
                  )}
                </div>
              </div>

              {/* Additional Images Gallery */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Images (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {baseData.additionalImages.map((img, index) => (
                    <div key={index} className="w-16 h-16 relative rounded-lg border overflow-hidden group">
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveAdditionalImage(index)} className="absolute top-0.5 right-0.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                  {baseData.additionalImages.length < 5 && (
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50">
                      <input type="file" accept="image/*" onChange={handleAdditionalImageUpload} disabled={isUploading} className="hidden" />
                      <span className="text-lg leading-none">+</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-lg">Variants (Weights & Prices)</h3>
              <button type="button" onClick={addVariant} className="text-sm font-bold bg-[#F98866] text-white px-3 py-1.5 rounded-lg hover:bg-[#e56b46]">+ Add Variant</button>
            </div>
            
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="pb-2 font-bold min-w-[80px]">Weight</th>
                    <th className="pb-2 font-bold w-16">Unit</th>
                    <th className="pb-2 font-bold w-24">MRP (₹)</th>
                    <th className="pb-2 font-bold w-24">Price (₹)</th>
                    <th className="pb-2 font-bold w-32">Stock Status</th>
                    <th className="pb-2 font-bold w-24 text-center">Visibility</th>
                    <th className="pb-2 font-bold w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => (
                    <tr key={variant.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 pr-2">
                        <input type="text" value={variant.weight} onChange={(e) => handleVariantChange(index, 'weight', e.target.value)} required className="w-full border-stone-300 rounded p-1.5 text-sm" placeholder="250" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="text" value={variant.unit} onChange={(e) => handleVariantChange(index, 'unit', e.target.value)} required className="w-full border-stone-300 rounded p-1.5 text-sm" placeholder="g" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" value={variant.mrp} onChange={(e) => handleVariantChange(index, 'mrp', Number(e.target.value))} required className="w-full border-stone-300 rounded p-1.5 text-sm" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" value={variant.sellingPrice} onChange={(e) => handleVariantChange(index, 'sellingPrice', Number(e.target.value))} required className="w-full border-stone-300 rounded p-1.5 text-sm" />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={variant.stockStatus} onChange={(e) => handleVariantChange(index, 'stockStatus', e.target.value)} className="w-full border-stone-300 rounded p-1.5 text-sm">
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2 text-center">
                        <button type="button" onClick={() => handleVariantChange(index, 'isActive', !variant.isActive)} className={`text-xs font-bold px-2 py-1 rounded w-full ${variant.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                          {variant.isActive ? '✓ Active' : '✕ Hidden'}
                        </button>
                      </td>
                      <td className="py-2 text-center">
                        <button type="button" onClick={() => removeVariant(index)} disabled={variants.length === 1} className="text-red-500 hover:bg-red-50 p-1.5 rounded disabled:opacity-30">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-sm font-black bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50">
              {isSaving ? 'Saving Group...' : 'Save Product Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
