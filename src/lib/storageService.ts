import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


/**
 * Upload an image file to Firebase Storage and return its public URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error('Firebase Storage is not configured.');
  }

  // Generate a unique filename using timestamp and a random string
  const fileExtension = file.name.split('.').pop();
  const fileName = `products/product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  
  const storageRef = ref(storage, fileName);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error('Failed to upload image. Ensure your Storage rules allow this.');
  }
}
