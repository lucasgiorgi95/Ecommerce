'use client';

import { useEffect, useRef, useCallback } from 'react';

type ProductEvent = {
  type: 'create' | 'update' | 'delete' | 'connected' | 'heartbeat';
  productId?: string;
  timestamp: string;
};

export function useProductEvents(onProductChange: () => void) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Permitir deshabilitar SSE via variable de entorno
  const sseEnabled = process.env.NEXT_PUBLIC_SSE_ENABLED !== 'false';

  const connect = useCallback(() => {
    if (!sseEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('SSE disabled via environment variable');
      }
      return;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/products/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SSE connection opened');
        }
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ProductEvent = JSON.parse(event.data);
          
          if (data.type === 'create' || data.type === 'update' || data.type === 'delete') {
            if (process.env.NODE_ENV === 'development') {
              console.log('Product change detected:', data);
            }
            onProductChange();
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error parsing SSE message:', error);
          }
        }
      };

      eventSource.onerror = () => {
        // Solo loggear en desarrollo para evitar spam en producción
        if (process.env.NODE_ENV === 'development') {
          console.warn('SSE connection error, attempting to reconnect...');
        }
        
        eventSource.close();
        
        // Intentar reconectar con backoff exponencial
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Max SSE reconnection attempts reached, falling back to polling');
          }
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating EventSource:', error);
      }
    }
  }, [onProductChange, sseEnabled]);

  useEffect(() => {
    if (sseEnabled) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect, sseEnabled]);

  return {
    reconnect: connect
  };
}