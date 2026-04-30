# UJ — Universal JSON

A tiny JSON wrapper with optional standardization and diffing.

## What is UJ?

UJ is a tiny JSON wrapper with optional standardization and diffing. It gives JSON-compatible payloads a predictable event shape:

```json
{
  "uj": "1.0",
  "type": "domain.action",
  "payload": {}
}

You can also include optional schema and meta fields when useful.

UJ provides:

a consistent wrapper for payloads
optional data standardization (safe or strict)
JSON Pointer-style diffing between states
Install
npm install uj
Basic usage
import { create, canonicalize, diff, is, unwrap } from "uj";

const event = create("user.created", { name: "  Alice  " });

const cleanEvent = create(
  "user.created",
  { name: "  Alice  ", age: "10" },
  { standardize: "safe" },
);

console.log(is(event, "user.created")); // true
console.log(unwrap(event)); // { name: "  Alice  " }
console.log(canonicalize({ name: "  Alice  " })); // { name: "Alice" }
console.log(diff(event.payload, cleanEvent.payload));
Wrapper-only mode

By default, create() only wraps the payload. It does not mutate or change payload values.

const payload = { name: "  Alice  ", age: "10" };
const event = create("user.created", payload);

event.payload === payload; // true
Safe standardization

Safe standardization cleans structure without changing meaning.

It:

trims strings
sorts object keys alphabetically
removes undefined object properties
converts undefined array entries to null
preserves array order and length
does not coerce types
does not change casing
does not guess dates

Objects are copied into null-prototype objects to prevent prototype pollution.

const event = create(
  "user.created",
  { z: undefined, name: "  Alice  ", tags: [" b ", undefined, "a"] },
  { standardize: "safe" },
);

console.log(event.payload);
// { name: "Alice", tags: ["b", null, "a"] }
Strict standardization

Strict standardization includes all safe rules and also coerces exact primitive strings:

"true" → true
"false" → false
"null" → null
numeric strings like "25" or "25.50" → numbers

It does NOT:

convert "00123"
convert ""
convert "25abc"
change casing
guess dates
const payload = canonicalize(
  { active: "true", age: "25", zip: "00123", empty: "" },
  { mode: "strict" },
);

console.log(payload);
// { active: true, age: 25, empty: "", zip: "00123" }
Diffing

diff() compares JSON-compatible structures deeply and returns JSON Pointer-style changes.

const changes = diff(
  { status: "draft", user: { name: "Alice" } },
  { status: "active", user: { name: "Ada" }, count: 1 },
);

console.log(changes);

Example output:

[
  { "path": "/count", "from": undefined, "to": 1, "op": "add" },
  { "path": "/status", "from": "draft", "to": "active", "op": "replace" },
  { "path": "/user/name", "from": "Alice", "to": "Ada", "op": "replace" }
]

Operations:

add
remove
replace

Circular structures throw a TypeError.

Type guard
if (is(event, "user.created")) {
  console.log(event.payload);
}
Unwrap
const payload = unwrap(event);
API
create(type: string, payload: unknown, options?: CreateOptions): UJEvent
canonicalize<T>(payload: T, options?: CanonicalizeOptions): T
diff(before: unknown, after: unknown): UJChange[]
is(value: unknown, type?: string): boolean
unwrap<T = unknown>(event: UJEvent<T>): T
type StandardizeMode = false | "safe" | "strict";

interface UJEvent<T = unknown> {
  uj: "1.0";
  type: string;
  payload: T;
  schema?: string;
  meta?: Record<string, unknown>;
}

interface CreateOptions {
  standardize?: StandardizeMode;
  schema?: string;
  meta?: Record<string, unknown>;
}

interface CanonicalizeOptions {
  mode?: "safe" | "strict";
}

interface UJChange {
  path: string;
  from: unknown;
  to: unknown;
  op: "add" | "remove" | "replace";
}
TypeScript note

create<T>() and canonicalize<T>() preserve generic types for usability.

Standardization may change runtime values:

safe mode can remove undefined object fields
safe mode converts undefined array entries to null
strict mode can coerce strings like "25", "true", "false", and "null"

When needed, define or narrow standardized payload types explicitly.

Event type note

UJ recommends type names like "domain.action" (example: "user.created").

UJ does not validate or enforce the type format in v0.1.0. It is convention-only.

Object Prototype Behavior

Canonicalized objects use null-prototype objects (Object.create(null)).

This prevents prototype pollution but means:

no inherited methods
use Object.hasOwn(obj, key) instead of obj.hasOwnProperty
Unsupported values

UJ is designed for JSON-compatible payloads.

It does not handle:

functions
symbols
bigint
Date instances

undefined object fields are removed during standardization.

undefined array entries become null to preserve array structure.

Circular objects and arrays throw a TypeError.

Security / Non-goals

UJ is NOT:

validation
sanitization
authorization
encryption
auditing
tracking
verification

UJ is not a security boundary. Applications must handle validation, authorization, and protection separately.

UJ only wraps and optionally standardizes JSON-compatible payloads.

What UJ is not

UJ does not:

create a backend
run an API server
track anything
store anything
replace JSON
validate schemas
secure payloads
perform analytics
use blockchain
