import { create } from "uj-json";

const event = create(
  "form.submitted",
  { name: "  Alice  ", age: "25", active: "true", zip: "00123" },
  { standardize: "strict" },
);

console.log(event);
