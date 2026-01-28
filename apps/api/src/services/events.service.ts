import { EventEmitter } from 'node:events';

export class EventsService extends EventEmitter {
  constructor() {
    super();
    // Increase limit for many concurrent SSE connections if needed
    this.setMaxListeners(100);
  }

  broadcast(event: string, data: any) {
    this.emit('broadcast', { event, data });
  }
}
