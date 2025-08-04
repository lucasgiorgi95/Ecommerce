// Servicio para manejar productos usando Prisma/SQLite a través de API routes

export type ProductStatus = 'published' | 'paused';

export type PrismaProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export const prismaProductsService = {
  // Obtener todos los productos
  async getProducts(): Promise<PrismaProduct[]> {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Agregar nuevo producto
  async addProduct(product: {
    name: string;
    description?: string;
    price: number;
    category?: string;
    images?: string[];
    status?: ProductStatus;
  }): Promise<PrismaProduct> {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear producto');
      }

      const result = await response.json();
      
      // Invalidar cache del frontend
      if (typeof window !== 'undefined') {
        const { cacheManager } = await import('@/lib/cache');
        cacheManager.invalidatePattern('products');
      }

      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Actualizar estado del producto
  async updateProductStatus(id: string, status: ProductStatus): Promise<void> {
    try {
      const response = await fetch(`/api/admin/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar estado');
      }

      // Invalidar cache del frontend
      if (typeof window !== 'undefined') {
        const { cacheManager } = await import('@/lib/cache');
        cacheManager.invalidatePattern('products');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  },

  // Eliminar producto
  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar producto');
      }

      // Invalidar cache del frontend
      if (typeof window !== 'undefined') {
        const { cacheManager } = await import('@/lib/cache');
        cacheManager.invalidatePattern('products');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Actualizar producto completo
  async updateProduct(id: string, product: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    status: ProductStatus;
  }>): Promise<PrismaProduct> {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Importar productos masivamente
  async bulkImport(products: Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
    images?: string[];
    status?: ProductStatus;
  }>): Promise<PrismaProduct[]> {
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la importación masiva');
      }

      const result = await response.json();
      return result.products;
    } catch (error) {
      console.error('Error bulk importing products:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  async getProduct(id: string): Promise<PrismaProduct> {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al obtener producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};