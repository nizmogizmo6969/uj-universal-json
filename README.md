# UJ — Universal JSON

Universal JSON diff engine for detecting structured change (delta) across any data structure.

---

## Why

Most systems don’t fail because of bad data  
They fail because they can’t track what changed.

UJ provides a deterministic way to detect, represent, and reason about change.

---

## Example

```ts
import { diff } from "uj";

const before = { a: 1, b: 2 };
const after  = { a: 1, b: 3 };

diff(before, after);
