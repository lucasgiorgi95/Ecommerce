// Utilidades para manejo de imágenes

export const getPlaceholderImage = (text: string, width: number = 300, height: number = 300): string => {
  // Usar placehold.co como alternativa más confiable
  const encodedText = encodeURIComponent(text);
  return `https://placehold.co/${width}x${height}/e5e7eb/6b7280?text=${encodedText}`;
};

export const getImageWithFallback = (imageUrl: string | undefined, fallbackText: string): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return getPlaceholderImage(fallbackText);
  }
  return imageUrl;
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, fallbackText: string) => {
  const img = event.currentTarget;
  img.src = getPlaceholderImage(fallbackText);
};