'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllCategories, Category } from '@/lib/categories';

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria') || 'todos';
  const [isOpen, setIsOpen] = useState(false);

  const categories = getAllCategories();

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (categorySlug === 'todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', categorySlug);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/productos?${queryString}` : '/productos';
    
    router.push(url);
    setIsOpen(false);
  };

  const getCurrentCategoryName = () => {
    if (currentCategory === 'todos') return 'Todas las categorías';
    const category = categories.find(cat => cat.slug === currentCategory || cat.id === currentCategory);
    return category?.name || 'Categoría desconocida';
  };

  return (
    <div className="relative">
      {/* Desktop Filter */}
      <div className="hidden md:flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryChange('todos')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === 'todos'
              ? 'bg-[#b8a089] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas las categorías
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              currentCategory === category.slug || currentCategory === category.id
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: currentCategory === category.slug || currentCategory === category.id 
                ? category.color 
                : undefined
            }}
          >
            <span>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <span className="font-medium text-gray-700">
            {getCurrentCategoryName()}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <button
              onClick={() => handleCategoryChange('todos')}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                currentCategory === 'todos' ? 'bg-[#f0e6dc] text-[#b8a089] font-medium' : ''
              }`}
            >
              Todas las categorías
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  currentCategory === category.slug || currentCategory === category.id
                    ? 'font-medium'
                    : ''
                }`}
                style={{
                  backgroundColor: currentCategory === category.slug || currentCategory === category.id 
                    ? `${category.color}15`
                    : undefined,
                  color: currentCategory === category.slug || currentCategory === category.id 
                    ? category.color
                    : undefined
                }}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}