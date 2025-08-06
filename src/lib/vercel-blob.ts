import { put, del, list } from '@vercel/blob';

export class VercelBlobService {
  /**
   * Subir una imagen a Vercel Blob Storage
   */
  static async uploadImage(file: File): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `products/${timestamp}-${randomString}.${extension}`;

      // Subir archivo a Vercel Blob
      const blob = await put(fileName, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/blob',
      });

      return blob.url;
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw new Error('Error al subir imagen a Vercel Blob');
    }
  }

  /**
   * Eliminar una imagen de Vercel Blob Storage
   */
  static async deleteImage(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error);
      // No lanzar error para no romper la funcionalidad
    }
  }

  /**
   * Listar todas las imágenes
   */
  static async listImages(): Promise<string[]> {
    try {
      const { blobs } = await list({
        prefix: 'products/',
      });
      
      return blobs.map(blob => blob.url);
    } catch (error) {
      console.error('Error listing Vercel Blob images:', error);
      return [];
    }
  }

  /**
   * Limpiar imágenes huérfanas (no utilizadas en productos)
   */
  static async cleanupUnusedImages(usedUrls: string[]): Promise<number> {
    try {
      const allImages = await this.listImages();
      const unusedImages = allImages.filter(url => !usedUrls.includes(url));
      
      // Eliminar imágenes no utilizadas
      await Promise.all(unusedImages.map(url => this.deleteImage(url)));
      
      return unusedImages.length;
    } catch (error) {
      console.error('Error cleaning up unused images:', error);
      return 0;
    }
  }
}