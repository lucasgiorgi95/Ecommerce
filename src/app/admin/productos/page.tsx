'use client';

import { useState, useEffect } from 'react';
import { prismaProductsService, PrismaProduct, ProductStatus } from '@/services/prismaProducts';
import { useToast } from '@/components/admin/ToastProvider';
import { useExportProducts } from '@/hooks/useExportProducts';
import SafeImage from '@/components/SafeImage';

export default function ProductsPage() {
  const [products, setProducts] = useState<PrismaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();
  const { exportToPDF, exportToExcel } = useExportProducts();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await prismaProductsService.getProducts();
      setProducts(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al cargar productos',
        message: 'No se pudieron cargar los productos'
      });
    } finally {
      setLoading(false);
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

      showToast({
        type: 'success',
        title: 'Estado actualizado',
        message: `Producto ${newStatus === 'published' ? 'publicado' : 'pausado'} exitosamente`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al actualizar estado',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
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
      setDeleteConfirm(null);

      showToast({
        type: 'success',
        title: 'Producto eliminado',
        message: 'El producto se eliminó exitosamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al eliminar producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setActionLoading(null);
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

  return (
    <div className="h-screen flex flex-col p-8">
      <div className="flex-shrink-0 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra todos los productos de tu tienda</p>
          </div>
          <button
            onClick={loadProducts}
            className="bg-[#b8a089] text-white px-4 py-2 rounded-md hover:bg-[#a08a7a] transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Botones de exportación */}
        <div className="flex gap-3">
          <button
            onClick={() => exportToPDF(products)}
            disabled={products.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          
          <button
            onClick={() => exportToExcel(products)}
            disabled={products.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        {products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer producto.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <SafeImage
                            className="h-12 w-12 rounded-lg"
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            fallbackText="Sin Imagen"
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
                      <div className="text-sm text-gray-900">{product.stock || 0} unidades</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => window.location.href = `/admin/productos/editar/${product.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          Editar
                        </button>

                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleStatusToggle(product.id, product.status)}
                          disabled={actionLoading === product.id}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            product.status === 'published'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === product.id ? (
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            product.status === 'published' ? 'Pausar' : 'Publicar'
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">¿Eliminar producto?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. El producto se eliminará permanentemente de Google Sheets.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === deleteConfirm ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}