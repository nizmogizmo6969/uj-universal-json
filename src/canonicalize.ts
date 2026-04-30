import type { CanonicalizeOptions } from "./types.js";

type CanonicalizeMode = NonNullable<CanonicalizeOptions["mode"]>;

const NUMERIC_STRING_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function canonicalize<T>(payload: T, options: CanonicalizeOptions = {}): T {
  const mode = options.mode ?? "safe";
  return canonicalizeValue(payload, mode, new WeakSet<object>()) as T;
}

function canonicalizeValue(
  value: unknown,
  mode: CanonicalizeMode,
  seen: WeakSet<object>,
): unknown {
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new TypeError("Cannot canonicalize circular arrays.");
    }

    seen.add(value);
    const result = value.map((item) =>
      item === undefined ? null : canonicalizeValue(item, mode, seen),
    );

    seen.delete(value);
    return result;
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      throw new TypeError("Cannot canonicalize circular objects.");
    }

    seen.add(value);
    const result: Record<string, unknown> = Object.create(null);

    for (const key of Object.keys(value).sort()) {
      const propertyValue = value[key];

      if (propertyValue !== undefined) {
        result[key] = canonicalizeValue(propertyValue, mode, seen);
      }
    }

    seen.delete(value);
    return result;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return mode === "strict" ? coerceStrictString(trimmed) : trimmed;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function coerceStrictString(value: string): unknown {
  if (value === "") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  if (NUMERIC_STRING_PATTERN.test(value)) {
    return Number(value);
  }

  return value;
}
