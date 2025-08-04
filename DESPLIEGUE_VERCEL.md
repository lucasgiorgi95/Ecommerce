# 🚀 Despliegue en Vercel

## ⚠️ Cambios Necesarios para Vercel

### **Problema con SQLite:**
- ❌ Vercel es serverless (sin disco persistente)
- ❌ SQLite se borra en cada deploy
- ✅ **Solución**: Usar PostgreSQL + Vercel Blob

## 🔄 Pasos para Desplegar en Vercel

### **1. Configurar Base de Datos PostgreSQL**

```bash
# En tu proyecto local:
npm install pg @types/pg
```

### **2. Crear Base de Datos en Vercel**
1. Ve a tu proyecto en Vercel Dashboard
2. Pestaña "Storage" → "Create Database"
3. Selecciona "Postgres"
4. Copia la `DATABASE_URL`

### **3. Configurar Variables de Entorno**
En Vercel Dashboard → Settings → Environment Variables:
```
DATABASE_URL=postgresql://usuario:password@host:5432/database
NEXT_PUBLIC_BASE_URL=https://tu-app.vercel.app
```

### **4. Actualizar Prisma Schema**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // ← Cambio de sqlite a postgresql
  url      = env("DATABASE_URL")
}
```

### **5. Crear Nueva Migración**
```bash
# Generar migración para PostgreSQL
npx prisma migrate dev --name switch-to-postgresql

# Generar cliente
npx prisma generate
```

### **6. Configurar Build Commands en Vercel**
En `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

### **7. Desplegar**
```bash
git add .
git commit -m "Configurado para Vercel con PostgreSQL"
git push origin main
```

En Vercel:
1. Conecta tu repositorio
2. Deploy automático ✅

## 📸 Manejo de Imágenes en Vercel

### **Problema**: 
- Las imágenes en `public/uploads/` se borran en cada deploy

### **Solución**: Usar Vercel Blob Storage

```bash
npm install @vercel/blob
```

Actualizar API de upload:
```typescript
// src/app/api/upload/route.ts
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Subir a Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
  });
  
  return NextResponse.json({
    url: blob.url
  });
}
```

## 🎯 Resultado Final

### **Lo que funciona en Vercel:**
- ✅ Base de datos PostgreSQL (persistente)
- ✅ Imágenes en Vercel Blob (persistente)
- ✅ Admin panel funcional
- ✅ Frontend sincronizado
- ✅ Deploy automático con Git

### **Flujo en Producción:**
```
Cliente sube imagen → Vercel Blob Storage → URL permanente
Cliente crea producto → PostgreSQL → Datos persistentes
Usuario ve producto → Todo funciona ✅
```

## 💰 Costos

### **Vercel Free Tier:**
- ✅ PostgreSQL: 60 horas de compute/mes
- ✅ Blob Storage: 1GB gratis
- ✅ Bandwidth: 100GB/mes

### **Para sitios pequeños:**
- Completamente gratis ✅

## 🚀 Deploy en 5 Minutos

1. **Fork/Clone** tu proyecto
2. **Cambiar** `sqlite` → `postgresql` en schema
3. **Crear** base de datos en Vercel
4. **Configurar** variables de entorno
5. **Push** a Git → Deploy automático ✅

¿Quieres que configure todo esto para que funcione en Vercel?