import { calculateBasicFurudh } from "./furudh";
import { calculateMasalah } from "./masalah";
import type { HeirInput } from "./types";

const heirs: HeirInput[] = [
  {
    id: "wife",
    count: 1,
  },
  {
    id: "mother",
    count: 1,
  },
  {
    id: "father",
    count: 1,
  },
  {
    id: "son",
    count: 1,
  },
  {
    id: "daughter",
    count: 1,
  },
];

const furudh = calculateBasicFurudh(heirs);

console.log("=== FURUDH ===");

for (const item of furudh) {
  console.log(
    item.heirId,
    item.fardh,
    item.reason
  );
}

const masalah = calculateMasalah(
  heirs,
  furudh
);

console.log("=== MASALAH ===");

console.log("أصل المسألة:", masalah.origin);

console.log(
  "Used shares:",
  masalah.usedShares
);

console.log(
  "Remainder:",
  masalah.remainder
);

for (const item of masalah.shares) {
  console.log(
    item.heirId,
    "=",
    item.shares
  );
}
