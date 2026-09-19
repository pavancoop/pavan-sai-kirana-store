import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
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
 * Delete a product.
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error('Firebase is not configured');
  }

  await deleteDoc(doc(db, 'products', id));
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
