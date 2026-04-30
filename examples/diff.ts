import { diff } from "uj";

const changes = diff(
  { theme: "light", notifications: { email: true }, shortcuts: ["save"] },
  {
    theme: "dark",
    notifications: { email: false },
    shortcuts: ["save", "search"],
  },
);

console.log(changes);
