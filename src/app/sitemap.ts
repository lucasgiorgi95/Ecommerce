import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllCategories } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // URLs de productos dinámicas
    const products = await prisma.product.findMany({
      where: { status: 'published' },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    });

    const productUrls: MetadataRoute.Sitemap = products.map((product, index) => ({
      url: `${baseUrl}/productos/${index + 1}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // URLs de categorías
    const categories = getAllCategories();
    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/productos?categoria=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...productUrls, ...categoryUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticUrls;
  }
}