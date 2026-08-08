import { calculateFaraid } from "./engine";
import type { FaraidCase } from "./types";

const testCase: FaraidCase = {
  deceasedGender: "male",

  estate: 240000000,

  funeralCost: 0,

  debt: 0,

  bequest: 0,

  heirs: [
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
  ],
};

const result =
  calculateFaraid(testCase);

console.log(
  "========== FARAID =========="
);

console.log(
  "أصل المسألة:",
  result.origin
);

console.log(
  "Total shares:",
  result.totalShares
);

console.log(
  "============================"
);

for (const heir of result.heirs) {
  console.log({
    id: heir.id,
    count: heir.count,
    type: heir.shareType,
    fraction: heir.fraction,
    shares: heir.shares,
    blocked: heir.blocked,
    reason: heir.reason,
  });
}

console.log(
  "============================"
);

console.log(
  "NOTES:",
  result.notes
);
