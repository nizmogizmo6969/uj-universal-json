export type StandardizeMode = false | "safe" | "strict";

export interface UJEvent<T = unknown> {
  uj: "1.0";
  type: string;
  payload: T;
  schema?: string;
  meta?: Record<string, unknown>;
}

export interface CreateOptions {
  standardize?: StandardizeMode;
  schema?: string;
  meta?: Record<string, unknown>;
}

export interface CanonicalizeOptions {
  mode?: "safe" | "strict";
}

export interface UJChange {
  path: string;
  from: unknown;
  to: unknown;
  op: "add" | "remove" | "replace";
}
