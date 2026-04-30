import { create, is, unwrap } from "uj-json";

const apiResponse = { id: 1, name: "Alice" };
const event = create("api.response", apiResponse);

console.log(event);

if (is(event, "api.response")) {
  const payload = unwrap(event);
  console.log(payload);
}
