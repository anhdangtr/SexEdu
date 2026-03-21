import { normalizeText } from "./text.util.js";

const INTENT_RULES = [
  { intent: "pregnancy", tests: ["mang thai", "co thai"] },
  { intent: "safety", tests: ["an toan", "dong thuan", "consent"] },
  { intent: "puberty", tests: ["day thi", "tuoi day thi", "puberty"] },
  { intent: "sti", tests: ["std", "sti", "benh lay truyen tinh duc"] },
  { intent: "contraception", tests: ["tranh thai", "bao cao su", "thuoc tranh thai"] },
];

export const detectIntent = (message) => {
  const normalized = normalizeText(message);

  const match = INTENT_RULES.find((rule) =>
    rule.tests.some((test) => normalized.includes(test))
  );

  return match?.intent ?? "general";
};
