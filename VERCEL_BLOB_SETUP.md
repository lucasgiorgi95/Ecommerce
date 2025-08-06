# Configuración de Vercel Blob Storage

## Problema Actual
Las imágenes no se están mostrando correctamente en producción porque Vercel Blob Storage no está configurado adecuadamente.

## Solución

### 1. Configurar Vercel Blob Storage

En tu dashboard de Vercel:

1. Ve a tu proyecto en Vercel
2. Navega a la pestaña "Storage"
3. Crea un nuevo Blob Store si no tienes uno
4. Vercel automáticamente configurará la variable `BLOB_READ_WRITE_TOKEN`

### 2. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas en Vercel:

- `BLOB_READ_WRITE_TOKEN` - Se configura automáticamente al crear el Blob Store
- `DATABASE_URL` - Tu conexión a la base de datos
- `JWT_SECRET` - Tu clave secreta para JWT

### 3. Re-deployar

Después de configurar el Blob Storage, haz un nuevo deployment:

```bash
git add .
git commit -m "Configure Vercel Blob Storage"
git push
```

### 4. Probar la Funcionalidad

1. Ve al admin de tu aplicación
2. Intenta subir una imagen nueva
3. Verifica que se muestre correctamente

## Fallback Actual

Si Vercel Blob falla, el sistema automáticamente:

1. Usa placeholders generados localmente
2. Registra el error en los logs
3. Permite que la aplicación siga funcionando

## Logs de Debugging

Para ver qué está pasando con las imágenes, revisa los logs en Vercel:

1. Ve a tu proyecto en Vercel
2. Navega a la pestaña "Functions"
3. Busca logs de `/api/upload`

## Comandos Útiles

```bash
# Verificar productos en la base de datos
npm run tsx scripts/check-products.ts

# Limpiar URLs problemáticas
npm run tsx scripts/fix-image-urls.ts

# Probar Vercel Blob (solo funciona en producción)
npm run tsx scripts/test-vercel-blob.ts
```