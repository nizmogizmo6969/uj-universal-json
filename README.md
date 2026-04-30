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

You can also include optional `schema` and `meta` fields when useful.

UJ simply gives JSON-compatible payloads a predictable wrapper, opt-in standardization helpers, and JSON Pointer-style diffs.

## Install

```sh
npm install uj
```

## Basic usage

```ts
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
```

## Wrapper-only mode

By default, `create()` only wraps the payload. It does not mutate or change payload values.

```ts
import { create } from "uj";

const payload = { name: "  Alice  ", age: "10" };
const event = create("user.created", payload);

event.payload === payload; // true
```

## Safe standardization

Safe standardization deeply sorts object keys alphabetically, trims strings, removes `undefined` object properties, and recurses into arrays and objects. It does not coerce types, change casing, or guess dates.

In arrays, `undefined` entries are converted to `null` to match JSON-compatible behavior while preserving array order and length.

Standardized objects are copied into null-prototype objects so keys like `__proto__`, `constructor`, and `prototype` are treated as plain data keys and do not mutate object prototypes.

```ts
import { create } from "uj";

const event = create(
  "user.created",
  { z: undefined, name: "  Alice  ", tags: [" b ", undefined, "a"] },
  { standardize: "safe" },
);

console.log(event.payload);
// { name: "Alice", tags: ["b", null, "a"] }
```

## Strict standardization

Strict standardization includes all safe rules and also coerces exact primitive strings:

- `"true"` to `true`
- `"false"` to `false`
- `"null"` to `null`
- Numeric strings like `"25"` or `"25.50"` to numbers

It does not coerce strings with leading zeros like `"00123"`, empty strings, change casing, or guess dates.

```ts
import { canonicalize } from "uj";

const payload = canonicalize(
  { active: "true", age: "25", zip: "00123", empty: "" },
  { mode: "strict" },
);

console.log(payload);
// { active: true, age: 25, empty: "", zip: "00123" }
```

## Diffing

`diff()` compares JSON-compatible structures deeply and returns JSON Pointer-style paths. Circular structures throw a `TypeError`.

```ts
import { diff } from "uj";

const changes = diff(
  { status: "draft", user: { name: "Alice" } },
  { status: "active", user: { name: "Ada" }, count: 1 },
);

console.log(changes);
// [
//   { path: "/count", from: undefined, to: 1, op: "add" },
//   { path: "/status", from: "draft", to: "active", op: "replace" },
//   { path: "/user/name", from: "Alice", to: "Ada", op: "replace" }
// ]
```

UJ does not validate schemas, sanitize input, secure payloads, track anything, or enforce type names.

## Security / Non-goals

UJ is NOT:

- validation
- sanitization
- authorization
- encryption
- auditing
- tracking
- verification

UJ is not a sanitizer, validator, auth layer, permission layer, or security boundary. Applications must validate, sanitize, authorize, and protect data separately before trusting or acting on it.

UJ only wraps and optionally standardizes JSON-compatible payloads.

## Object Prototype Behavior

Canonicalized objects use null-prototype objects (`Object.create(null)`).

This prevents prototype pollution but means:

- no inherited methods
- use `Object.hasOwn()` instead of `obj.hasOwnProperty`

## Unsupported values

UJ is designed for JSON-compatible payloads. It does not serialize or normalize JavaScript-only values such as functions, symbols, `bigint`, or `Date` instances.

`undefined` object fields are removed during standardization. `undefined` array entries become `null` during standardization to preserve array order and length.

Circular objects and arrays cannot be canonicalized and throw a `TypeError`.

## API

```ts
create(type: string, payload: unknown, options?: CreateOptions): UJEvent
canonicalize<T>(payload: T, options?: CanonicalizeOptions): T
is(value: unknown, type?: string): boolean
unwrap<T = unknown>(event: UJEvent<T>): T
diff(before: unknown, after: unknown): UJChange[]
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

### TypeScript note

`create<T>()` and `canonicalize<T>()` preserve generic types for usability. Standardization may change runtime values: safe mode can remove `undefined` object fields and convert `undefined` array entries to `null`, while strict mode can coerce strings like `"25"`, `"true"`, `"false"`, and `"null"`. Type narrowed standardized payloads explicitly when needed.

### Event type note

UJ recommends type names like `"domain.action"`, such as `"user.created"`. UJ does not validate or enforce the type string format in v0.1.0; `type` is convention-only.

## What UJ is not

UJ does not create a backend.

UJ does not track anything.

UJ does not verify or audit anything.

UJ does not replace JSON.

UJ does not sanitize, authorize, encrypt, or validate payloads.

UJ is not a blockchain, API server, analytics tool, schema registry, or validation system.
