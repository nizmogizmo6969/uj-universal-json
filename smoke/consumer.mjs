import assert from "node:assert/strict";
import { canonicalize, create, diff, is, unwrap } from "../dist/index.js";

const event = create("user.created", { name: "  Alice  " });
const safe = create(
  "user.created",
  { name: "  Alice  ", age: "10" },
  { standardize: "safe" },
);
const strict = create(
  "user.created",
  { name: "  Alice  ", age: "10" },
  { standardize: "strict" },
);

assert.equal(event.payload.name, "  Alice  ");
assert.equal(event.uj, "1.0");
assert.equal(safe.payload.name, "Alice");
assert.equal(safe.payload.age, "10");
assert.equal(strict.payload.age, 10);
assert.equal(is(event, "user.created"), true);
assert.equal(unwrap(event).name, "  Alice  ");
assert.equal(canonicalize({ name: "  Alice  " }).name, "Alice");
assert.deepEqual(diff({ status: "PENDING" }, { status: "DONE" }), [
  { path: "/status", from: "PENDING", to: "DONE", op: "replace" },
]);
