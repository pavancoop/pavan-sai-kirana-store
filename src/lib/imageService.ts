import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, isFirebaseConfigured } from './firebase';

/**
 * ImageService abstraction.
 * Currently uses Firebase Storage, but is designed to be easily swapped 
 * with Cloudinary or another external CDN without affecting the rest of the application.
 */

export async function uploadProductImage(file: File): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Storage is not configured.');
  }

  // Basic client-side validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WEBP are supported.');
  }

  // Size warning/compression could go here. 
  // Currently, we'll reject files over 3MB to prevent bloat until a compressor is added.
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('File is too large. Please upload an image under 3MB.');
  }

  const storage = getStorage(app!);
  // Generate a unique filename: timestamp + random + extension
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `products/prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const storageRef = ref(storage, filename);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return downloadUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !isFirebaseConfigured()) return;
  
  // Only attempt to delete if it's a Firebase Storage URL
  if (!imageUrl.includes('firebasestorage.googleapis.com')) {
    return;
  }

  try {
    const storage = getStorage(app!);
    // Firebase Storage URLs contain the full path encoded in the URL.
    // We can just create a ref from the URL itself.
    const fileRef = ref(storage, imageUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Failed to delete image from storage:', error);
    // We swallow the error because if the image is missing, we don't want to break the app.
  }
}

export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
