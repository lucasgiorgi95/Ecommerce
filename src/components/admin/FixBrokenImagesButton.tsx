'use client';

import { useState } from 'react';

export default function FixBrokenImagesButton() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFixImages = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fix-broken-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        🔧 Herramientas de mantenimiento
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        Si ves errores 404 en las imágenes, usa esta herramienta para corregir las rutas rotas.
      </p>
      
      <button
        onClick={handleFixImages}
        disabled={isFixing}
        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isFixing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Corrigiendo imágenes...
          </>
        ) : (
          'Corregir imágenes rotas'
        )}
      </button>

      {result && (
        <div className="mt-3 p-2 bg-white rounded border text-sm">
          {result}
        </div>
      )}
    </div>
  );
}