import { describe, expect, it } from "vitest";
import { create, is } from "../src/index.js";

describe("is", () => {
  it("identifies UJ events", () => {
    const event = create("user.created", { name: "Alice" });

    expect(is(event)).toBe(true);
  });

  it("matches an optional event type", () => {
    const event = create("user.created", { name: "Alice" });

    expect(is(event, "user.created")).toBe(true);
    expect(is(event, "user.deleted")).toBe(false);
  });

  it("rejects non-UJ values", () => {
    expect(is(null)).toBe(false);
    expect(is({})).toBe(false);
    expect(is({ uj: "1.0", type: "user.created" })).toBe(false);
    expect(is({ uj: "2.0", type: "user.created", payload: {} })).toBe(false);
    expect(is({ uj: "1.0", type: 123, payload: {} })).toBe(false);
    expect(is({ uj: "1.0", type: "user.created", payload: undefined })).toBe(
      true,
    );
  });
});
