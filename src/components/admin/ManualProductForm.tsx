'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { prismaProductsService, PrismaProduct, ProductStatus } from '@/services/prismaProducts';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
};

export default function ManualProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    images: []
  });
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [products, setProducts] = useState<PrismaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Upload local de imágenes
  const uploadImageLocally = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir imagen');
    }

    const result = await response.json();
    return result.url;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(file => uploadImageLocally(file));
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));

      // Mostrar notificación de éxito
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Imágenes subidas',
            message: `${urls.length} imagen(es) subida(s) exitosamente`
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      
      // Mostrar notificación de error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            title: 'Error al subir imágenes',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await prismaProductsService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: ProductStatus) => {
    const newStatus: ProductStatus = currentStatus === 'published' ? 'paused' : 'published';
    
    try {
      setActionLoading(id);
      await prismaProductsService.updateProductStatus(id, newStatus);
      
      // Actualizar estado local
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

      // Mostrar notificación
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Estado actualizado',
            message: `Producto ${newStatus === 'published' ? 'publicado' : 'pausado'} exitosamente`
          }
        }));
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            title: 'Error al actualizar estado',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      await prismaProductsService.deleteProduct(id);
      
      // Actualizar estado local
      setProducts(prev => prev.filter(p => p.id !== id));

      // Mostrar notificación
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Producto eliminado',
            message: 'El producto se eliminó exitosamente'
          }
        }));
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            title: 'Error al eliminar producto',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.images.length > 0 ? formData.images : ['https://via.placeholder.com/300x300?text=Sin+Imagen'],
        status: 'published' as const
      };

      const newProduct = await prismaProductsService.addProduct(productData);
      
      // Actualizar lista local
      setProducts(prev => [newProduct, ...prev]);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        images: []
      });

      // Mostrar notificación de éxito
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Producto cargado exitosamente',
            message: 'El producto se agregó correctamente'
          }
        }));
      }
      
    } catch (error) {
      console.error('Error uploading product:', error);
      
      // Mostrar notificación de error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            title: 'Error al cargar producto',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Agregar Producto Manualmente</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del producto */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del producto
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
            placeholder="Ej: Camiseta de algodón"
          />
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
          >
            <option value="">Seleccionar categoría</option>
            <option value="men's clothing">Ropa de hombre</option>
            <option value="women's clothing">Ropa de mujer</option>
            <option value="jewelery">Joyería</option>
            <option value="electronics">Electrónicos</option>
          </select>
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
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
            placeholder="Describe las características del producto..."
          />
        </div>

        {/* Precio */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Precio
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
            placeholder="0.00"
          />
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes del producto
          </label>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-[#b8a089] bg-[#f9f7f5]'
                : 'border-gray-300 hover:border-[#b8a089] hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600">
                <span className="font-medium text-[#b8a089]">Haz clic para subir</span> o arrastra las imágenes aquí
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 10MB cada una</p>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 text-sm text-[#b8a089]">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo imágenes...
              </div>
            </div>
          )}

          {/* Preview de imágenes */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes cargadas:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón de envío */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#b8a089] text-white py-3 px-4 rounded-md hover:bg-[#a08a7a] focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Subiendo imágenes...' : 'Subir Producto'}
          </button>
        </div>
      </form>

      {/* Tabla de productos cargados */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Productos Cargados</h3>
          <button
            onClick={loadProducts}
            className="text-[#b8a089] hover:text-[#8a7158] transition-colors flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b8a089]"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay productos cargados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.slice(0, 10).map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <Image
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.images[0] || 'https://via.placeholder.com/40x40?text=Sin+Imagen'}
                                alt={product.name}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status === 'published' ? 'Publicado' : 'Pausado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleStatusToggle(product.id, product.status)}
                              disabled={actionLoading === product.id}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                product.status === 'published'
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              } disabled:opacity-50`}
                            >
                              {actionLoading === product.id ? '...' : (
                                product.status === 'published' ? 'Pausar' : 'Publicar'
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={actionLoading === product.id}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}