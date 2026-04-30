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
```

You can also include optional `schema` and `meta` fields when useful. UJ provides a consistent wrapper for payloads, optional data standardization (safe or strict), and JSON Pointer-style diffing between states.

## Install

```sh
npm install uj-json
```

## Basic usage

```ts
import { create, canonicalize, diff, is, unwrap } from "uj-json";

const event = create("user.created", { name: "  Alice  " });

const cleanEvent = create(
  "user.created",
  { name: "  Alice  ", age: "10" },
  { standardize: "safe" }
);

console.log(is(event, "user.created")); // true
console.log(unwrap(event)); // { name: "  Alice  " }
console.log(canonicalize({ name: "  Alice  " })); // { name: "Alice" }
console.log(diff(event.payload, cleanEvent.payload));
```

## Wrapper-only mode

By default, `create()` only wraps the payload. It does not mutate or change payload values.

```ts
const payload = { name: "  Alice  ", age: "10" };
const event = create("user.created", payload);

event.payload === payload; // true
```

## Safe standardization

Safe standardization cleans structure without changing meaning. It trims strings, sorts object keys alphabetically, removes `undefined` object properties, converts `undefined` array entries to `null`, preserves array order and length, and does not coerce types, change casing, or guess dates. Objects are copied into null-prototype objects to prevent prototype pollution.

```ts
const event = create(
  "user.created",
  { z: undefined, name: "  Alice  ", tags: [" b ", undefined, "a"] },
  { standardize: "safe" }
);

console.log(event.payload);
// { name: "Alice", tags: ["b", null, "a"] }
```

## Strict standardization

Strict standardization includes all safe rules and also coerces exact primitive strings. It converts `"true"` to `true`, `"false"` to `false`, `"null"` to `null`, and numeric strings like `"25"` or `"25.50"` to numbers. It does not convert `"00123"`, empty strings, strings like `"25abc"`, change casing, or guess dates.

```ts
const payload = canonicalize(
  { active: "true", age: "25", zip: "00123", empty: "" },
  { mode: "strict" }
);

console.log(payload);
// { active: true, age: 25, empty: "", zip: "00123" }
```

## Diffing

`diff()` compares JSON-compatible structures deeply and returns JSON Pointer-style changes.

```ts
const changes = diff(
  { status: "draft", user: { name: "Alice" } },
  { status: "active", user: { name: "Ada" }, count: 1 }
);

console.log(changes);
```

Example output:

```ts
[
  { path: "/count", from: undefined, to: 1, op: "add" },
  { path: "/status", from: "draft", to: "active", op: "replace" },
  { path: "/user/name", from: "Alice", to: "Ada", op: "replace" }
]
```

Operations include `add`, `remove`, and `replace`. Circular structures throw a `TypeError`.

## Type guard

```ts
if (is(event, "user.created")) {
  console.log(event.payload);
}
```

## Unwrap

```ts
const payload = unwrap(event);
```

## API

```ts
create(type: string, payload: unknown, options?: CreateOptions): UJEvent
canonicalize<T>(payload: T, options?: CanonicalizeOptions): T
diff(before: unknown, after: unknown): UJChange[]
is(value: unknown, type?: string): boolean
unwrap<T = unknown>(event: UJEvent<T>): T
```

```ts
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
```

## TypeScript note

`create<T>()` and `canonicalize<T>()` preserve generic types for usability, but standardization may change runtime values. Safe mode can remove `undefined` object fields and convert `undefined` array entries to `null`, while strict mode can coerce strings like `"25"`, `"true"`, `"false"`, and `"null"`. Narrow types explicitly when needed.

## Event type note

UJ recommends type names like `"domain.action"` (for example `"user.created"`). UJ does not validate or enforce this format.

## Object Prototype Behavior

Canonicalized objects use null-prototype objects created with `Object.create(null)`. This prevents prototype pollution but means they do not inherit methods like `hasOwnProperty`. Use `Object.hasOwn(obj, key)` instead.

## Unsupported values

UJ is designed for JSON-compatible payloads. It does not handle functions, symbols, bigint values, or Date instances. `undefined` object fields are removed during standardization, and `undefined` array entries become `null` to preserve array structure. Circular objects and arrays throw a `TypeError`.

## Security / Non-goals

UJ is not a validator, sanitizer, authorization layer, encryption tool, auditing system, tracking system, or verification system. It is not a security boundary. Applications must handle validation, authorization, and protection separately. UJ only wraps and optionally standardizes JSON-compatible payloads.

## What UJ is not

UJ does not create a backend, run an API server, track or store data, replace JSON, validate schemas, secure payloads, perform analytics, or use blockchain.

## License

MIT
