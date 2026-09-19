import Papa from 'papaparse';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Product } from '@/types';

// CSV Column mapping expectation (case-insensitive in code, but good for template)
export const CSV_HEADERS = [
  'Name', 'Brand', 'Category', 'Subcategory', 'Selling Price', 'MRP', 
  'Weight', 'Unit', 'Image URL', 'Search Keywords', 'Active'
];

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

export async function parseAndImportCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        resolve(await processImportData(rows));
      },
      error: (error: any) => {
        resolve({ success: false, importedCount: 0, errors: [error.message] });
      }
    });
  });
}

async function processImportData(rows: any[]): Promise<ImportResult> {
  if (!isFirebaseConfigured() || !db) {
    return { success: false, importedCount: 0, errors: ['Firebase is not configured.'] };
  }

  const errors: string[] = [];
  let importedCount = 0;

  // We will match existing products by slug to update them instead of duplicating
  const productsRef = collection(db, 'products');
  const existingDocs = await getDocs(productsRef);
  const existingSlugs = new Map<string, string>(); // slug -> documentId
  existingDocs.forEach(d => {
    existingSlugs.set(d.data().slug, d.id);
  });

  // Batch limits to 500. We'll use chunks of 400.
  const CHUNK_SIZE = 400;
  
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    
    for (const [index, row] of chunk.entries()) {
      const rowIndex = i + index + 2; // +2 for 1-based index and header row
      
      // Map CSV columns (handling slight variations in naming)
      const name = row['Name'] || row['name'] || '';
      if (!name) {
        errors.push(`Row ${rowIndex}: Missing required 'Name' field.`);
        continue;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const sellingPrice = parseFloat(row['Selling Price'] || row['Price'] || row['sellingPrice'] || '0');
      const mrp = parseFloat(row['MRP'] || row['mrp'] || '0');
      
      const discount = mrp > sellingPrice 
        ? Math.round(((mrp - sellingPrice) / mrp) * 100) 
        : 0;

      const rawKeywords = row['Search Keywords'] || row['Keywords'] || row['searchKeywords'] || '';
      const searchKeywords = rawKeywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      
      const activeRaw = row['Active'] || row['isActive'];
      const isActive = activeRaw === undefined ? true : String(activeRaw).toLowerCase() !== 'false' && String(activeRaw) !== '0';

      const productData: Omit<Product, 'id'> = {
        name,
        slug,
        brand: row['Brand'] || row['brand'] || '',
        category: row['Category'] || row['category'] || 'Uncategorized',
        subcategory: row['Subcategory'] || row['subcategory'] || '',
        weight: row['Weight'] || row['weight'] || '1',
        unit: row['Unit'] || row['unit'] || 'pc',
        sellingPrice,
        mrp,
        discount,
        image: row['Image URL'] || row['Image'] || row['image'] || '',
        stockStatus: 'in_stock', // Default for import
        stockQuantity: 100,
        description: row['Description'] || row['description'] || '',
        searchKeywords,
        isActive,
      };

      let docRef;
      if (existingSlugs.has(slug)) {
        // Update existing product
        const id = existingSlugs.get(slug)!;
        docRef = doc(db, 'products', id);
        batch.set(docRef, { ...productData, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        // Create new product
        docRef = doc(productsRef);
        batch.set(docRef, { ...productData, id: docRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        // Update local map so we don't create duplicates if the CSV has duplicate slugs internally
        existingSlugs.set(slug, docRef.id);
      }
      importedCount++;
    }

    try {
      await batch.commit();
    } catch (err: any) {
      console.error(err);
      errors.push(`Failed to commit batch: ${err.message}`);
    }
  }

  return {
    success: errors.length === 0,
    importedCount,
    errors
  };
}
