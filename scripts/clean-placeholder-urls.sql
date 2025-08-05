-- Script para limpiar URLs de via.placeholder.com de la base de datos
-- Ejecutar este script en tu base de datos PostgreSQL

-- Ver productos con URLs problemáticas
SELECT id, name, images 
FROM products 
WHERE images LIKE '%via.placeholder.com%';

-- Actualizar productos con URLs problemáticas
UPDATE products 
SET images = REPLACE(
  REPLACE(
    REPLACE(images, 'https://via.placeholder.com/300x300?text=Camiseta', '/api/placeholder?width=300&height=300&text=Camiseta'),
    'https://via.placeholder.com/300x300?text=Pantalon', '/api/placeholder?width=300&height=300&text=Pantalon'
  ),
  'https://via.placeholder.com/300x300?text=Collar', '/api/placeholder?width=300&height=300&text=Collar'
)
WHERE images LIKE '%via.placeholder.com%';

-- Verificar que se actualizaron correctamente
SELECT id, name, images 
FROM products 
WHERE images LIKE '%/api/placeholder%';