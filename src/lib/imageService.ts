import { app, isFirebaseConfigured } from './firebase';

/**
 * ImageService abstraction.
 * Uses Cloudinary unsigned upload for product images.
 */

export async function uploadProductImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log('Cloudinary Cloud Name:', cloudName);
  console.log('Cloudinary Upload Preset:', uploadPreset);

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  // Validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are supported.');
  }

  // 5 MB limit
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File is too large. Please upload an image under 5MB.');
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  // We do not delete the old Cloudinary image when replacing an image yet. 
  // Safe cleanup will be implemented later.
  return Promise.resolve();
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
