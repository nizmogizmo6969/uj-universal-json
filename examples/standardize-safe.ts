import { create } from "uj-json";

const event = create(
  "profile.submitted",
  {
    name: "  Alice  ",
    age: "10",
    tags: [" beta ", undefined, "ADMIN"],
    unused: undefined,
  },
  { standardize: "safe" },
);

console.log(event);
