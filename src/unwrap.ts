import type { UJEvent } from "./types.js";

export function unwrap<T = unknown>(event: UJEvent<T>): T {
  return event.payload;
}
