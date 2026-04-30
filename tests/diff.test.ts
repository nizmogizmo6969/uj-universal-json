import { describe, expect, it } from "vitest";
import { canonicalize, diff } from "../src/index.js";

describe("diff", () => {
  it("detects add, remove, and replace operations with JSON Pointer paths", () => {
    const changes = diff(
      {
        status: "draft",
        removeMe: true,
        user: { name: "Alice", role: "admin" },
        items: [{ id: 1 }, { id: 2 }],
      },
      {
        status: "active",
        user: { name: "Ada" },
        items: [{ id: 1 }, { id: 3 }, { id: 4 }],
        added: "yes",
      },
    );

    expect(changes).toEqual([
      { path: "/added", from: undefined, to: "yes", op: "add" },
      { path: "/items/1/id", from: 2, to: 3, op: "replace" },
      { path: "/items/2", from: undefined, to: { id: 4 }, op: "add" },
      { path: "/removeMe", from: true, to: undefined, op: "remove" },
      { path: "/status", from: "draft", to: "active", op: "replace" },
      { path: "/user/name", from: "Alice", to: "Ada", op: "replace" },
      { path: "/user/role", from: "admin", to: undefined, op: "remove" },
    ]);
  });

  it("returns no changes for deeply equal values", () => {
    expect(diff({ a: [1, { b: null }] }, { a: [1, { b: null }] })).toEqual([]);
  });

  it("handles null correctly", () => {
    expect(diff({ value: null }, { value: "null" })).toEqual([
      { path: "/value", from: null, to: "null", op: "replace" },
    ]);
  });

  it("uses Object.is semantics for primitive equality", () => {
    expect(diff({ value: NaN }, { value: NaN })).toEqual([]);
    expect(diff({ value: 0 }, { value: -0 })).toEqual([
      { path: "/value", from: 0, to: -0, op: "replace" },
    ]);
  });

  it("escapes JSON Pointer path segments", () => {
    expect(diff({ "a/b": 1, "x~y": 2 }, { "a/b": 3, "x~y": 4 })).toEqual([
      { path: "/a~1b", from: 1, to: 3, op: "replace" },
      { path: "/x~0y", from: 2, to: 4, op: "replace" },
    ]);
  });

  it("diffs canonicalized null-prototype objects deeply", () => {
    const before = canonicalize({ a: { z: "z" }, b: "b" });
    const after = canonicalize({ a: { z: "x" }, b: "b" });

    expect(diff(before, after)).toEqual([
      { path: "/a/z", from: "z", to: "x", op: "replace" },
    ]);
  });

  it("throws a clear error for circular objects in either input", () => {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    before.self = before;
    after.self = after;

    expect(() => diff(before, {})).toThrow("Cannot diff circular structures.");
    expect(() => diff({}, after)).toThrow("Cannot diff circular structures.");
  });

  it("throws a clear error for circular arrays in either input", () => {
    const before: unknown[] = [];
    const after: unknown[] = [];
    before.push(before);
    after.push(after);

    expect(() => diff(before, [])).toThrow("Cannot diff circular structures.");
    expect(() => diff([], after)).toThrow("Cannot diff circular structures.");
  });
});
