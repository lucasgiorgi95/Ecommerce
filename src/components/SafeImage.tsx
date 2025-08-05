'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getPlaceholderImageDataUrl } from '@/lib/placeholderImage';

interface SafeImageProps {
  src: string | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackText = 'Sin Imagen',
  priority = false
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si la URL es problemática (via.placeholder.com u otros servicios no confiables)
  const isProblematicUrl = src && (
    src.includes('via.placeholder.com') || 
    src.includes('placeholder.com') ||
    src.startsWith('https://via.placeholder')
  );

  // Si no hay src, hubo error, o es una URL problemática, usar placeholder
  if (!src || imageError || isProblematicUrl) {
    const placeholderSrc = getPlaceholderImageDataUrl(fallbackText, width, height);
    
    return (
      <img
        src={placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Verificar si es una URL válida para next/image
  const isValidNextImageUrl = src.startsWith('/') || 
    src.startsWith('http://') || 
    src.startsWith('https://') ||
    src.startsWith('data:');

  // Si no es una URL válida, usar placeholder
  if (!isValidNextImageUrl) {
    const placeholderSrc = getPlaceholderImageDataUrl(fallbackText, width, height);
    
    return (
      <img
        src={placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}