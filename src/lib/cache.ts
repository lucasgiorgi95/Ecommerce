// Sistema de cache con invalidación automática
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
};

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private subscribers = new Map<string, Set<() => void>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    // Notificar a los suscriptores
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => callback());
    }
  }

  invalidatePattern(pattern: string): void {
    // Invalidar todas las claves que coincidan con el patrón
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.invalidate(key);
      }
    }
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Retornar función de cleanup
    return () => {
      const keySubscribers = this.subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.delete(callback);
        if (keySubscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.clear();
  }
}

export const cacheManager = new CacheManager();