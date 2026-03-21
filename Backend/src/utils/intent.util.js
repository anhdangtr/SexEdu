import { normalizeText } from "./text.util.js";

const INTENT_RULES = [
  {
    intent: "harmful_request",
    tests: [
      "how to rape",
      "rape someone",
      "force someone to have sex",
      "hide rape evidence",
      "avoid evidence",
      "not get caught",
      "child porn",
      "underage porn",
    ],
  },
  {
    intent: "support_or_safety",
    tests: [
      "i was raped",
      "i am raped",
      "i was assaulted",
      "sexual assault",
      "sexual abuse",
      "what should i do if i am raped",
      "what should i do if i was raped",
      "bi hiep dam",
      "bi xam hai",
      "bi cuong hiep",
      "bi lam dung",
      "can giup",
      "help me stay safe",
      "dong thuan",
      "consent",
      "an toan",
      "safety",
      "pregnancy prevention",
      "condom",
      "how to use a condom",
      "tranh thai",
      "bao cao su",
    ],
  },
  {
    intent: "sexual_explicit_request",
    tests: [
      "describe sex in detail",
      "69",
      "doggy",
      "porn",
      "sex video",
      "xxx",
      "mo ta chi tiet",
      "tu the",
      "kich thich",
      "fetish",
    ],
  },
  {
    intent: "education",
    tests: [
      "what is",
      "rape la gi",
      "puberty",
      "day thi",
      "std",
      "sti",
      "benh lay truyen tinh duc",
      "mang thai",
      "co thai",
      "sinh san",
      "giao duc gioi tinh",
    ],
  },
];

export const detectIntent = (message) => {
  const normalized = normalizeText(message);

  const match = INTENT_RULES.find((rule) =>
    rule.tests.some((test) => normalized.includes(test))
  );

  return match?.intent ?? "unclear";
};
