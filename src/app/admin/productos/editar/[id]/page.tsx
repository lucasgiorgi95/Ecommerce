'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { prismaProductsService, PrismaProduct, ProductStatus } from '@/services/prismaProducts';
import { useToast } from '@/components/admin/ToastProvider';
import SafeImage from '@/components/SafeImage';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<PrismaProduct | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    status: 'published' as ProductStatus,
    images: [] as string[]
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await prismaProductsService.getProduct(id);
      setProduct(productData);
      
      setFormData({
        name: productData.name,
        description: productData.description || '',
        price: productData.price.toString(),
        category: productData.category || '',
        stock: productData.stock.toString(),
        status: productData.status,
        images: productData.images
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al cargar producto',
        message: 'No se pudo cargar el producto'
      });
      router.push('/admin/productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price.trim()) {
      showToast({
        type: 'error',
        title: 'Campos requeridos',
        message: 'El nombre y precio son obligatorios'
      });
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock) || 0;

    if (isNaN(price) || price <= 0) {
      showToast({
        type: 'error',
        title: 'Precio inválido',
        message: 'El precio debe ser un número mayor a 0'
      });
      return;
    }

    if (stock < 0) {
      showToast({
        type: 'error',
        title: 'Stock inválido',
        message: 'El stock no puede ser negativo'
      });
      return;
    }

    try {
      setSaving(true);
      
      await prismaProductsService.updateProduct(id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price,
        category: formData.category.trim() || undefined,
        stock,
        status: formData.status,
        images: formData.images
      });

      showToast({
        type: 'success',
        title: 'Producto actualizado',
        message: 'El producto se actualizó exitosamente'
      });

      router.push('/admin/productos');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al actualizar',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b8a089]"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
          <button
            onClick={() => router.push('/admin/productos')}
            className="bg-[#b8a089] text-white px-4 py-2 rounded-md hover:bg-[#a08a7a] transition-colors"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Producto</h1>
            <p className="text-gray-600">Modifica los datos del producto</p>
          </div>
          <button
            onClick={() => router.push('/admin/productos')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del producto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
              placeholder="Describe el producto..."
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Categoría y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
                placeholder="Ej: Electrónicos, Ropa, etc."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
              >
                <option value="published">Publicado</option>
                <option value="paused">Pausado</option>
              </select>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto
            </label>
            
            {/* Agregar nueva imagen */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent"
                placeholder="URL de la imagen"
              />
              <button
                type="button"
                onClick={addImage}
                className="bg-[#b8a089] text-white px-4 py-2 rounded-md hover:bg-[#a08a7a] transition-colors"
              >
                Agregar
              </button>
            </div>

            {/* Lista de imágenes */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/admin/productos')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#b8a089] text-white rounded-md hover:bg-[#a08a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}