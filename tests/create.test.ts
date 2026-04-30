import { describe, expect, it } from "vitest";
import { create, unwrap } from "../src/index.js";

describe("create", () => {
  it("wraps without changing payload by default", () => {
    const payload = { name: "  Alice  ", age: "10", nested: { active: "true" } };

    const event = create("user.created", payload);

    expect(event).toEqual({
      uj: "1.0",
      type: "user.created",
      payload,
    });
    expect(event.payload).toBe(payload);
    expect("schema" in event).toBe(false);
    expect("meta" in event).toBe(false);
  });

  it("adds schema and meta when provided", () => {
    const meta = { source: "test" };

    const event = create(
      "user.created",
      { name: "Alice" },
      { schema: "user.created.v1", meta },
    );

    expect(event.schema).toBe("user.created.v1");
    expect(event.meta).toBe(meta);
  });

  it("does not standardize unless requested", () => {
    const payload = {
      name: "  Alice  ",
      age: "10",
      active: "true",
      unused: undefined,
    };

    const event = create("user.created", payload, { standardize: false });

    expect(event.payload).toBe(payload);
    expect(event.payload).toEqual({
      name: "  Alice  ",
      age: "10",
      active: "true",
      unused: undefined,
    });
  });

  it("standardizes safely when requested", () => {
    const payload = { z: undefined, name: "  Alice  ", age: "10" };

    const event = create("user.created", payload, { standardize: "safe" });

    expect(event.payload).toEqual({ age: "10", name: "Alice" });
    expect(payload).toEqual({ z: undefined, name: "  Alice  ", age: "10" });
  });

  it("standardizes strictly when requested", () => {
    const event = create(
      "user.updated",
      { active: "true", age: "25" },
      { standardize: "strict" },
    );

    expect(event.payload).toEqual({ active: true, age: 25 });
  });

  it("unwrap returns the event payload", () => {
    const payload = { name: "Alice" };
    const event = create("user.created", payload);

    expect(unwrap(event)).toBe(payload);
  });
});
