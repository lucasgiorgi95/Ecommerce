// Generar imágenes placeholder usando canvas (lado cliente)

export function generatePlaceholderDataURL(
  width: number = 300,
  height: number = 300,
  text: string = 'Sin Imagen',
  backgroundColor: string = '#e5e7eb',
  textColor: string = '#6b7280'
): string {
  // Solo funciona en el cliente
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="Arial, sans-serif" font-size="16">${text}</text>
      </svg>
    `)}`;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fondo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Texto
  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 10}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toDataURL('image/png');
}

export function getPlaceholderImage(text: string, width: number = 300, height: number = 300): string {
  // Usar nuestro endpoint local para generar placeholders
  const encodedText = encodeURIComponent(text);
  return `/api/placeholder?width=${width}&height=${height}&text=${encodedText}`;
}

export function getPlaceholderImageDataUrl(text: string, width: number = 300, height: number = 300): string {
  // Usar SVG como fallback más confiable para data URLs
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="1" y="1" width="${width-2}" height="${height-2}" fill="none" stroke="#d1d5db" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(12, Math.min(width, height) / 15)}">${text}</text>
    </svg>
  `)}`;
  
  return svgDataUrl;
}