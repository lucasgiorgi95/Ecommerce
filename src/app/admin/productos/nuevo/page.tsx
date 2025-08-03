'use client';

import { useState } from 'react';
import ManualProductForm from '@/components/admin/ManualProductForm';
import BulkProductUpload from '@/components/admin/BulkProductUpload';

export default function NewProductPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cargar Productos</h1>
        <p className="text-gray-600">Agrega nuevos productos a tu tienda</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manual'
                  ? 'border-[#b8a089] text-[#b8a089]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Carga Manual
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bulk'
                  ? 'border-[#b8a089] text-[#b8a089]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Carga Masiva
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'manual' && <ManualProductForm />}
          {activeTab === 'bulk' && <BulkProductUpload />}
        </div>
      </div>
    </div>
  );
}