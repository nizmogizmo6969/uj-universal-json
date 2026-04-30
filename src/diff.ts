import type { UJChange } from "./types.js";

const MISSING = Symbol("missing");

export function diff(before: unknown, after: unknown): UJChange[] {
  assertNoCircularStructures(before, new WeakSet<object>());
  assertNoCircularStructures(after, new WeakSet<object>());

  return diffValue(before, after, "");
}

function diffValue(before: unknown, after: unknown, path: string): UJChange[] {
  if (Object.is(before, after)) {
    return [];
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    return diffArrays(before, after, path);
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    return diffObjects(before, after, path);
  }

  return [{ path, from: before, to: after, op: "replace" }];
}

function diffArrays(before: unknown[], after: unknown[], path: string): UJChange[] {
  const changes: UJChange[] = [];
  const maxLength = Math.max(before.length, after.length);

  for (let index = 0; index < maxLength; index += 1) {
    const itemPath = joinPointer(path, String(index));
    const hasBefore = index in before;
    const hasAfter = index in after;

    if (!hasBefore && hasAfter) {
      changes.push({ path: itemPath, from: undefined, to: after[index], op: "add" });
    } else if (hasBefore && !hasAfter) {
      changes.push({
        path: itemPath,
        from: before[index],
        to: undefined,
        op: "remove",
      });
    } else if (hasBefore && hasAfter) {
      changes.push(...diffValue(before[index], after[index], itemPath));
    }
  }

  return changes;
}

function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  path: string,
): UJChange[] {
  const changes: UJChange[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of [...keys].sort()) {
    const childPath = joinPointer(path, key);
    const beforeValue = Object.prototype.hasOwnProperty.call(before, key)
      ? before[key]
      : MISSING;
    const afterValue = Object.prototype.hasOwnProperty.call(after, key)
      ? after[key]
      : MISSING;

    if (beforeValue === MISSING) {
      changes.push({ path: childPath, from: undefined, to: afterValue, op: "add" });
    } else if (afterValue === MISSING) {
      changes.push({
        path: childPath,
        from: beforeValue,
        to: undefined,
        op: "remove",
      });
    } else {
      changes.push(...diffValue(beforeValue, afterValue, childPath));
    }
  }

  return changes;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function assertNoCircularStructures(
  value: unknown,
  seen: WeakSet<object>,
): void {
  if (!Array.isArray(value) && !isPlainObject(value)) {
    return;
  }

  if (seen.has(value)) {
    throw new TypeError("Cannot diff circular structures.");
  }

  seen.add(value);

  const children = Array.isArray(value) ? value : Object.values(value);
  for (const child of children) {
    assertNoCircularStructures(child, seen);
  }

  seen.delete(value);
}

function joinPointer(basePath: string, key: string): string {
  const escapedKey = key.replace(/~/g, "~0").replace(/\//g, "~1");
  return `${basePath}/${escapedKey}`;
}
