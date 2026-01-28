import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { EventsService } from '../services/events.service';

type Bindings = {};
type Variables = {
  eventsService: EventsService;
};

export const events = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .get('/', async (c) => {
    const eventsService = c.get('eventsService');

    return streamSSE(c, async (stream) => {
      // Periodic ping to keep connection alive
      const pingInterval = setInterval(async () => {
        await stream.writeSSE({
          event: 'ping',
          data: new Date().toISOString(),
        });
      }, 30000);

      const onBroadcast = async ({ event, data }: { event: string; data: any }) => {
        await stream.writeSSE({
          event,
          data: JSON.stringify(data),
        });
      };

      eventsService.on('broadcast', onBroadcast);

      // Cleanup on disconnect
      stream.onAbort(() => {
        clearInterval(pingInterval);
        eventsService.off('broadcast', onBroadcast);
        console.log('SSE: Client disconnected');
      });

      console.log('SSE: Client connected');

      // Keep-alive loop
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });
  });
