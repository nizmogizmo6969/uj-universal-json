import { create } from "uj";

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
