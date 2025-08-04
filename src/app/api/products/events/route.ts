import { NextRequest } from 'next/server';
import { connections } from '@/lib/productEvents';

export async function GET(request: NextRequest) {
  // Configurar headers para SSE
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const stream = new ReadableStream({
    start(controller) {
      // Agregar conexión al store
      connections.add(controller);

      // Enviar mensaje inicial
      controller.enqueue('data: {"type":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n');

      // Configurar heartbeat cada 30 segundos
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue('data: {"type":"heartbeat","timestamp":"' + new Date().toISOString() + '"}\n\n');
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(controller);
        }
      }, 30000);

      // Cleanup cuando se cierra la conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Ignorar errores al cerrar
        }
      });
    },
    cancel() {
      // Cleanup adicional si es necesario
    }
  });

  return new Response(stream, { headers });
}