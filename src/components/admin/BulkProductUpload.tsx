'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

type ExcelProduct = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
};

export default function BulkProductUpload() {
  const [excelData, setExcelData] = useState<ExcelProduct[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('El archivo debe tener al menos una fila de encabezados y una fila de datos');
        }
        
        // Obtener encabezados (primera fila)
        const headers = jsonData[0] as string[];
        const requiredHeaders = ['name', 'description', 'price', 'category'];
        
        // Verificar que existan los encabezados requeridos
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h?.toLowerCase().trim() === header.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          throw new Error(`Faltan las siguientes columnas: ${missingHeaders.join(', ')}`);
        }
        
        // Procesar datos (desde la segunda fila)
        const products = (jsonData.slice(1) as any[][]).map((row, index) => {
          const product: any = {};
          
          headers.forEach((header, colIndex) => {
            if (header) {
              const key = header.toLowerCase().trim();
              product[key] = row[colIndex];
            }
          });
          
          // Validar campos requeridos
          if (!product.name || !product.description || !product.price || !product.category) {
            throw new Error(`Fila ${index + 2}: Faltan campos requeridos (name, description, price, category)`);
          }
          
          return {
            name: String(product.name).trim(),
            description: String(product.description).trim(),
            price: parseFloat(product.price) || 0,
            category: String(product.category).trim(),
            stock: parseInt(product.stock) || 0,
            image: product.image ? String(product.image).trim() : 'https://placehold.co/300x300/e5e7eb/6b7280?text=Sin+Imagen'
          };
        });

        setExcelData(products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
        setExcelData([]);
      } finally {
        setParsing(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error al leer el archivo');
      setParsing(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (excelData.length === 0) return;

    try {
      setParsing(true);
      
      // Importar el servicio
      const { prismaProductsService } = await import('@/services/prismaProducts');
      
      // Convertir datos Excel al formato esperado
      const productsToImport = excelData.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: product.image ? [product.image] : ['https://placehold.co/300x300/e5e7eb/6b7280?text=Sin+Imagen'],
        status: 'published' as const
      }));

      await prismaProductsService.bulkImport(productsToImport);
      
      // Mostrar notificación de éxito
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'success',
            title: 'Importación exitosa',
            message: `${excelData.length} productos importados correctamente`
          }
        }));
      }
      
      // Reset
      setExcelData([]);
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
    // Crear datos de ejemplo
    const templateData = [
      {
        'name': 'Camiseta Básica',
        'description': 'Camiseta de algodón 100% en varios colores',
        'price': 29.99,
        'category': "men's clothing",
        'stock': 50,
        'image': 'https://placehold.co/300x300/e5e7eb/6b7280?text=Camiseta'
      },
      {
        'name': 'Pantalón Jeans',
        'description': 'Pantalón de mezclilla clásico con corte recto',
        'price': 59.99,
        'category': "men's clothing",
        'stock': 30,
        'image': 'https://placehold.co/300x300/e5e7eb/6b7280?text=Pantalon'
      },
      {
        'name': 'Collar de Plata',
        'description': 'Collar elegante de plata 925 con colgante',
        'price': 89.99,
        'category': 'jewelery',
        'stock': 15,
        'image': 'https://placehold.co/300x300/e5e7eb/6b7280?text=Collar'
      }
    ];

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 20 }, // name
      { wch: 50 }, // description
      { wch: 10 }, // price
      { wch: 15 }, // category
      { wch: 8 },  // stock
      { wch: 60 }  // image
    ];
    ws['!cols'] = colWidths;
    
    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    
    // Descargar
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Carga Masiva por Excel</h2>
      
      <div className="space-y-6">
        {/* Instrucciones y plantilla */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-blue-700 space-y-1 mb-3">
            <li>• El archivo Excel debe contener las columnas: name, description, price, category, stock, image</li>
            <li>• Las categorías válidas son: men&apos;s clothing, women&apos;s clothing, jewelery, electronics</li>
            <li>• El precio debe ser un número (ej: 29.99)</li>
            <li>• El stock debe ser un número entero (ej: 50)</li>
            <li>• La imagen debe ser una URL válida (opcional)</li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar plantilla Excel
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
              <span className="font-medium text-[#b8a089] text-lg">Haz clic para subir tu archivo Excel</span>
              <p className="text-gray-600">o arrastra el archivo aquí</p>
            </div>
            <p className="text-sm text-gray-500">Solo archivos .xlsx o .xls</p>
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
        {excelData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Preview: {excelData.length} productos encontrados en {fileName}
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
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.slice(0, 5).map((product, index) => (
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
                        <div className="text-sm text-gray-900">{product.stock} unidades</div>
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
            
            {excelData.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                ... y {excelData.length - 5} productos más
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleImport}
                className="w-full bg-[#b8a089] text-white py-3 px-4 rounded-md hover:bg-[#a08a7a] focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:ring-offset-2 transition-colors"
              >
                Importar {excelData.length} productos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}