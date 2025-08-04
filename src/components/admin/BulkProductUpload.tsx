'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

type CSVProduct = {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export default function BulkProductUpload() {
  const [csvData, setCsvData] = useState<CSVProduct[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const products = results.data.map((row: unknown, index: number) => {
            const typedRow = row as Record<string, string>;
            // Validar campos requeridos
            if (!typedRow.name || !typedRow.description || !typedRow.price || !typedRow.category) {
              throw new Error(`Fila ${index + 1}: Faltan campos requeridos`);
            }

            return {
              name: typedRow.name.trim(),
              description: typedRow.description.trim(),
              price: parseFloat(typedRow.price),
              category: typedRow.category.trim(),
              image: typedRow.image?.trim() || 'https://via.placeholder.com/300x300?text=Sin+Imagen'
            };
          });

          setCsvData(products);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
          setCsvData([]);
        } finally {
          setParsing(false);
        }
      },
      error: (error) => {
        setError(`Error al leer el archivo: ${error.message}`);
        setParsing(false);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (csvData.length === 0) return;

    try {
      setParsing(true);
      
      // Importar el servicio
      const { prismaProductsService } = await import('@/services/prismaProducts');
      
      // Convertir datos CSV al formato esperado
      const productsToImport = csvData.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.image ? [product.image] : ['https://via.placeholder.com/300x300?text=Sin+Imagen'],
        status: 'published' as const
      }));

      await prismaProductsService.bulkImport(productsToImport);
      
      // Mostrar notificación de éxito
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Importación exitosa',
            message: `${csvData.length} productos importados correctamente`
          }
        }));
      }
      
      // Reset
      setCsvData([]);
      setFileName('');
      
    } catch (error) {
      console.error('Error importing products:', error);
      
      // Mostrar notificación de error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            title: 'Error en la importación',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    } finally {
      setParsing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,description,price,category,image
Camiseta Básica,Camiseta de algodón 100% en varios colores,29.99,men's clothing,https://via.placeholder.com/300x300?text=Camiseta
Pantalón Jeans,Pantalón de mezclilla clásico con corte recto,59.99,men's clothing,https://via.placeholder.com/300x300?text=Pantalon
Collar de Plata,Collar elegante de plata 925 con colgante,89.99,jewelery,https://via.placeholder.com/300x300?text=Collar`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Carga Masiva por CSV</h2>
      
      <div className="space-y-6">
        {/* Instrucciones y plantilla */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-blue-700 space-y-1 mb-3">
            <li>• El archivo CSV debe contener las columnas: name, description, price, category, image</li>
            <li>• Las categorías válidas son: men&apos;s clothing, women&apos;s clothing, jewelery, electronics</li>
            <li>• El precio debe ser un número (ej: 29.99)</li>
            <li>• La imagen debe ser una URL válida (opcional)</li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Descargar plantilla de ejemplo
          </button>
        </div>

        {/* Área de subida */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-[#b8a089] bg-[#f9f7f5]'
              : 'border-gray-300 hover:border-[#b8a089] hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-5c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <span className="font-medium text-[#b8a089] text-lg">Haz clic para subir tu archivo CSV</span>
              <p className="text-gray-600">o arrastra el archivo aquí</p>
            </div>
            <p className="text-sm text-gray-500">Solo archivos .csv</p>
          </div>
        </div>

        {parsing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 text-sm text-[#b8a089]">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando archivo...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al procesar el archivo</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview de productos */}
        {csvData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Preview: {csvData.length} productos encontrados en {fileName}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.slice(0, 5).map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#f0e6dc] text-[#b8a089]">
                          {product.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {csvData.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                ... y {csvData.length - 5} productos más
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleImport}
                className="w-full bg-[#b8a089] text-white py-3 px-4 rounded-md hover:bg-[#a08a7a] focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:ring-offset-2 transition-colors"
              >
                Importar {csvData.length} productos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}