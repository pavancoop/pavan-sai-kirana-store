import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { Product } from '@/types';
import { demoProducts } from '@/data/demo-products';

/**
 * Fetch all products from Firestore.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    // If no Firebase, return empty or we could return DEMO_PRODUCTS in the storefront
    return [];
  }

  const productsRef = collection(db, 'products');
  // Order by category then name, or just name. Let's do name for simplicity.
  const q = query(productsRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    return { ...docSnap.data(), id: docSnap.id } as Product;
  });
}

/**
 * Create a new product.
 */
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = doc(collection(db, 'products'));
  const newProduct = {
    ...product,
    id: docRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newProduct);
  return newProduct as Product;
}

/**
 * Update an existing product.
 */
export async function updateProduct(id: string, productUpdate: Partial<Product>): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  const docRef = doc(db, 'products', id);
  await setDoc(docRef, {
    ...productUpdate,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Save an entire Product Group using a batch write.
 */
export async function saveProductGroup(
  baseDetails: Partial<Product>,
  variants: Product[],
  deletedVariantIds: string[]
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  const batch = writeBatch(db!);

  // 1. Delete removed variants
  deletedVariantIds.forEach(id => {
    if (id && !id.startsWith('new_')) {
      batch.delete(doc(db!, 'products', id));
    }
  });

  // 2. Upsert variants
  variants.forEach(variant => {
    // Generate a new ID if it's a new variant
    const isNew = !variant.id || variant.id.startsWith('new_');
    const docRef = isNew ? doc(collection(db!, 'products')) : doc(db!, 'products', variant.id);

    // Merge base details into the variant
    const finalProduct = {
      ...variant,
      ...baseDetails,
      id: docRef.id,
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {})
    };

    batch.set(docRef, finalProduct, { merge: true });
  });

  await batch.commit();
}

/**
 * Delete a product.
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  await deleteDoc(doc(db, 'products', id));
}

/**
 * Delete all products.
 */
export async function deleteAllProducts(): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  // Use Promise.all with chunks or direct deleteDoc for simplicity
  const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db!, 'products', docSnap.id)));
  await Promise.all(deletePromises);
}

/**
 * Seed database with demo products if empty.
 */
export async function seedDemoProducts(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;

  const currentProducts = await getProducts();
  if (currentProducts.length > 0) {
    console.info('[ProductService] Database already has products. Skipping seed.');
    return;
  }

  console.info('[ProductService] Seeding demo products...');
  const batch = [];
  
  // Need to import DEMO_PRODUCTS dynamically or statically to avoid circular deps if any
  const { demoProducts: demoData } = await import('@/data/demo-products');

  for (const product of demoData) {
    // Exclude id so we get a new firestore document ID, or keep the original ID.
    // Let's keep original ID for consistency if it's a string, or just use it.
    const { id, ...rest } = product;
    const docRef = doc(db, 'products', id);
    const newProduct = {
      ...rest,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.push(setDoc(docRef, newProduct));
  }

  await Promise.all(batch);
  console.info('[ProductService] Seeding complete.');
}
