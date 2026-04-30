import { canonicalize } from "./canonicalize.js";
import type { CreateOptions, UJEvent } from "./types.js";

export function create<T>(
  type: string,
  payload: T,
  options: CreateOptions = {},
): UJEvent<T> {
  const event: UJEvent<T> = {
    uj: "1.0",
    type,
    payload:
      options.standardize === "safe" || options.standardize === "strict"
        ? canonicalize(payload, { mode: options.standardize })
        : payload,
  };

  if (options.schema !== undefined) {
    event.schema = options.schema;
  }

  if (options.meta !== undefined) {
    event.meta = options.meta;
  }

  return event;
}
