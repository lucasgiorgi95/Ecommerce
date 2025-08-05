import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('width') || '300');
  const height = parseInt(searchParams.get('height') || '300');
  const text = searchParams.get('text') || 'Sin Imagen';
  const bg = searchParams.get('bg') || 'f3f4f6';
  const color = searchParams.get('color') || '6b7280';

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bg}"/>
      <rect x="1" y="1" width="${width-2}" height="${height-2}" fill="none" stroke="#d1d5db" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#${color}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(12, Math.min(width, height) / 15)}">${text}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}