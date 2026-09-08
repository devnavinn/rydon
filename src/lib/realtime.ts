import "server-only";

import { EventEmitter } from "node:events";

// A process-local pub/sub bus that backs the SSE endpoints. Good enough for a
// single Node process; a multi-instance deployment would need to swap this
// for a shared broker (Redis pub/sub, etc.) without changing any callers.
const globalForRealtime = globalThis as unknown as { __realtimeBus?: EventEmitter };

const bus = globalForRealtime.__realtimeBus ?? new EventEmitter();
bus.setMaxListeners(0);
if (!globalForRealtime.__realtimeBus) globalForRealtime.__realtimeBus = bus;

export type RealtimeMessage = { event: string; data: unknown };

export function publish(room: string, event: string, data: unknown) {
  bus.emit(room, { event, data } satisfies RealtimeMessage);
}

export function subscribe(room: string, listener: (message: RealtimeMessage) => void) {
  bus.on(room, listener);
  return () => bus.off(room, listener);
}
