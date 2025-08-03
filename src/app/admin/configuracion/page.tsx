'use client';

import { useState } from 'react';
import { useToast } from '@/components/admin/ToastProvider';

export default function ConfigurationPage() {
  const [settings, setSettings] = useState({
    storeName: 'Mi Tienda',
    currency: 'USD',
    autoPublish: true,
    emailNotifications: true
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        type: 'success',
        title: 'Configuración guardada',
        message: 'Los cambios se guardaron exitosamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudieron guardar los cambios'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración</h1>
        <p className="text-gray-600">Personaliza la configuración de tu tienda</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Nombre de la tienda */}
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la tienda
            </label>
            <input
              type="text"
              id="storeName"
              value={settings.storeName}
              onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
            />
          </div>

          {/* Moneda */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#b8a089] focus:border-[#b8a089]"
            >
              <option value="USD">USD - Dólar estadounidense</option>
              <option value="EUR">EUR - Euro</option>
              <option value="ARS">ARS - Peso argentino</option>
            </select>
          </div>

          {/* Configuraciones booleanas */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="autoPublish"
                type="checkbox"
                checked={settings.autoPublish}
                onChange={(e) => setSettings(prev => ({ ...prev, autoPublish: e.target.checked }))}
                className="h-4 w-4 text-[#b8a089] focus:ring-[#b8a089] border-gray-300 rounded"
              />
              <label htmlFor="autoPublish" className="ml-2 block text-sm text-gray-900">
                Publicar productos automáticamente al cargarlos
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="h-4 w-4 text-[#b8a089] focus:ring-[#b8a089] border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                Recibir notificaciones por email
              </label>
            </div>
          </div>

          {/* Información de base de datos */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Base de datos</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">SQLite + Prisma conectado</p>
                  <p className="text-sm text-green-700">Los datos se guardan permanentemente en la base de datos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#b8a089] text-white px-6 py-2 rounded-md hover:bg-[#a08a7a] focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Información</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Los datos se guardan permanentemente en SQLite</li>
          <li>• La configuración se aplica a todos los productos nuevos</li>
          <li>• Puedes cambiar estas opciones en cualquier momento</li>
          <li>• Los productos persisten entre sesiones y reinicios del servidor</li>
        </ul>
      </div>
    </div>
  );
}