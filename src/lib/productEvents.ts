// Store para mantener las conexiones SSE activas
const connections = new Set<ReadableStreamDefaultController>();

// Función para notificar a todas las conexiones
export function notifyProductChange(type: 'create' | 'update' | 'delete', productId?: string) {
  const message = JSON.stringify({
    type,
    productId,
    timestamp: new Date().toISOString()
  });

  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Remover conexiones cerradas
      connections.delete(controller);
    }
  });
}

// Export connections for use in API route
export { connections };