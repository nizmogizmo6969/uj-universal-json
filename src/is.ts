export function is(value: unknown, type?: string): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (value.uj !== "1.0" || typeof value.type !== "string") {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(value, "payload")) {
    return false;
  }

  return type === undefined || value.type === type;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
