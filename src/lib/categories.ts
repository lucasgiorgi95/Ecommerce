// Sistema de categorías robusto
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
}

export const CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electrónicos',
    slug: 'electronics',
    description: 'Dispositivos electrónicos y tecnología',
    icon: '📱',
    color: '#3B82F6',
    order: 1
  },
  {
    id: 'mens-clothing',
    name: 'Ropa de Hombre',
    slug: 'mens-clothing',
    description: 'Ropa y accesorios para hombre',
    icon: '👔',
    color: '#6366F1',
    order: 2
  },
  {
    id: 'womens-clothing',
    name: 'Ropa de Mujer',
    slug: 'womens-clothing',
    description: 'Ropa y accesorios para mujer',
    icon: '👗',
    color: '#EC4899',
    order: 3
  },
  {
    id: 'jewelery',
    name: 'Joyería',
    slug: 'jewelery',
    description: 'Joyas y accesorios elegantes',
    icon: '💎',
    color: '#F59E0B',
    order: 4
  },
  {
    id: 'home-garden',
    name: 'Hogar y Jardín',
    slug: 'home-garden',
    description: 'Productos para el hogar y jardín',
    icon: '🏠',
    color: '#10B981',
    order: 5
  },
  {
    id: 'sports',
    name: 'Deportes',
    slug: 'sports',
    description: 'Equipamiento deportivo y fitness',
    icon: '⚽',
    color: '#EF4444',
    order: 6
  }
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

export function getCategoriesByParent(parentId?: string): Category[] {
  return CATEGORIES
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

export function getAllCategories(): Category[] {
  return CATEGORIES.sort((a, b) => a.order - b.order);
}

export function formatCategoryName(categoryKey: string): string {
  const category = getCategoryById(categoryKey) || getCategoryBySlug(categoryKey);
  return category?.name || categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
}

// Mapeo de categorías de la API externa a nuestro sistema
export const CATEGORY_MAPPING: Record<string, string> = {
  "men's clothing": 'mens-clothing',
  "women's clothing": 'womens-clothing',
  "electronics": 'electronics',
  "jewelery": 'jewelery'
};