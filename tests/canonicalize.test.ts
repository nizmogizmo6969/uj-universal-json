import { describe, expect, it } from "vitest";
import { canonicalize } from "../src/index.js";

describe("canonicalize", () => {
  it("trims strings, sorts object keys, and removes undefined properties in safe mode", () => {
    const payload = {
      z: " last ",
      a: " first ",
      skip: undefined,
      nested: {
        b: " second ",
        a: " first ",
        skip: undefined,
      },
    };

    const result = canonicalize(payload, { mode: "safe" });

    expect(Object.keys(result)).toEqual(["a", "nested", "z"]);
    expect(Object.keys(result.nested)).toEqual(["a", "b"]);
    expect(result).toEqual({
      a: "first",
      nested: { a: "first", b: "second" },
      z: "last",
    });
  });

  it("preserves array order and converts undefined array entries to null", () => {
    const payload = [" b ", undefined, " a ", { z: " z ", a: " a " }];

    const result = canonicalize(payload, { mode: "safe" });

    expect(result).toEqual(["b", null, "a", { a: "a", z: "z" }]);
  });

  it("does not coerce values, change casing, or guess dates in safe mode", () => {
    const result = canonicalize(
      {
        active: "true",
        disabled: "false",
        none: "null",
        age: "25",
        name: "ALICE",
        date: "2026-04-30",
      },
      { mode: "safe" },
    );

    expect(result).toEqual({
      active: "true",
      age: "25",
      date: "2026-04-30",
      disabled: "false",
      name: "ALICE",
      none: "null",
    });
  });

  it("does not mutate inputs", () => {
    const payload = {
      z: " z ",
      nested: { b: " b ", a: " a " },
      list: [" x ", undefined],
    };

    const result = canonicalize(payload, { mode: "safe" });

    expect(result).not.toBe(payload);
    expect(result.nested).not.toBe(payload.nested);
    expect(result.list).not.toBe(payload.list);
    expect(payload).toEqual({
      z: " z ",
      nested: { b: " b ", a: " a " },
      list: [" x ", undefined],
    });
  });

  it("copies prototype-sensitive keys without mutating prototypes", () => {
    const payload = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":"safe","prototype":"safe"}',
    ) as Record<string, unknown>;

    const result = canonicalize(payload, { mode: "safe" }) as Record<
      string,
      unknown
    >;

    expect(Object.getPrototypeOf(result)).toBe(null);
    expect(result.__proto__).toEqual({ polluted: true });
    expect(result.constructor).toBe("safe");
    expect(result.prototype).toBe("safe");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("canonicalizes already canonicalized null-prototype objects", () => {
    const first = canonicalize({ b: " b ", a: { z: " z " } });
    const second = canonicalize(first);

    expect(second).toEqual(first);
  });

  it("throws a clear error for circular objects", () => {
    const payload: Record<string, unknown> = {};
    payload.self = payload;

    expect(() => canonicalize(payload, { mode: "safe" })).toThrow(
      "Cannot canonicalize circular objects.",
    );
  });

  it("throws a clear error for circular arrays", () => {
    const payload: unknown[] = [];
    payload.push(payload);

    expect(() => canonicalize(payload, { mode: "safe" })).toThrow(
      "Cannot canonicalize circular arrays.",
    );
  });

  it("converts exact primitive and numeric strings in strict mode", () => {
    const payload = {
      active: "true",
      disabled: "false",
      none: "null",
      age: "25",
      debt: "-25",
      zero: "0",
      fraction: "0.5",
      price: "25.50",
    };

    const result = canonicalize(payload, { mode: "strict" });

    expect(result).toEqual({
      active: true,
      age: 25,
      debt: -25,
      disabled: false,
      fraction: 0.5,
      none: null,
      price: 25.5,
      zero: 0,
    });
    expect(payload).toEqual({
      active: "true",
      disabled: "false",
      none: "null",
      age: "25",
      debt: "-25",
      zero: "0",
      fraction: "0.5",
      price: "25.50",
    });
  });

  it("does not convert leading-zero, empty, non-numeric, or date strings in strict mode", () => {
    const result = canonicalize(
      {
        zip: "00123",
        empty: "",
        paddedEmpty: "   ",
        mixed: "25abc",
        date: "2026-04-30",
      },
      { mode: "strict" },
    );

    expect(result).toEqual({
      date: "2026-04-30",
      empty: "",
      mixed: "25abc",
      paddedEmpty: "",
      zip: "00123",
    });
  });
});
