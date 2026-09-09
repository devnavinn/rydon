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

const HEARTBEAT_MS = 25_000;

/** An SSE `Response` that streams every message published to `room` until the request is aborted. */
export function sseResponse(room: string, request: Request) {
  const encoder = new TextEncoder();

  let unsubscribe: () => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (message: RealtimeMessage) => {
        controller.enqueue(
          encoder.encode(`event: ${message.event}\ndata: ${JSON.stringify(message.data)}\n\n`)
        );
      };

      unsubscribe = subscribe(room, send);
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), HEARTBEAT_MS);
    },
    cancel() {
      unsubscribe?.();
      clearInterval(heartbeat);
    },
  });

  request.signal.addEventListener("abort", () => {
    unsubscribe?.();
    clearInterval(heartbeat);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
