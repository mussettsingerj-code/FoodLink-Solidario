import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Comprime y optimiza una imagen antes de la subida para garantizar rendimiento y velocidad.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Sube la imagen del producto utilizando Firebase Storage cuando está disponible,
 * o como Data URL optimizado para disponibilidad inmediata en cualquier entorno.
 */
export async function uploadProductImage(file: File, sellerId: string): Promise<string> {
  // Comprimir imagen
  let imageBlob: Blob = file;
  try {
    imageBlob = await compressImage(file);
  } catch (err) {
    console.warn('Compresión omitida:', err);
  }

  // Intentar Firebase Storage
  if (storage) {
    try {
      const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const storagePath = `products/${sellerId || 'common'}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, imageBlob, {
        contentType: file.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (storageErr) {
      console.warn('Firebase Storage no disponible o sin permiso, usando Data URL:', storageErr);
    }
  }

  // Fallback seguro a Data URL base64
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(imageBlob);
  });
}
