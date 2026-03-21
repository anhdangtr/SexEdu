const RULE_DEFINITIONS = [
  {
    tag: "minor_sexual",
    score: 5,
    action: "block",
    tests: [
      /\b(minor|underage|child|kid|teen|teenager)\b/i,
      /\b(sex|sexual|intim|nude|porn|quan he)\b/i,
    ],
  },
  {
    tag: "coercion_intimacy",
    score: 4,
    action: "block",
    tests: [
      /\b(coerc|force|forced|ep buoc|cuong ep)\b/i,
      /\b(sex|sexual|intim|kiss|quan he)\b/i,
    ],
  },
  {
    tag: "partner_violence",
    score: 4,
    action: "redirect",
    tests: [
      /\b(partner|boyfriend|girlfriend|husband|wife|nguoi yeu|vo|chong)\b/i,
      /\b(violence|abuse|hit|hurt|beat|danh|bao luc)\b/i,
    ],
  },
  {
    tag: "explicit_sexual_content",
    score: 3,
    action: "review",
    tests: [
      /\b(explicit|porn|fetish)\b/i,
    ],
  },
  {
    tag: "victim_support",
    score: -4,
    action: "allow",
    tests: [
      /\b(i was raped|i am raped|i was assaulted|i was abused|bi hiep dam|bi xam hai|bi cuong hiep)\b/i,
    ],
  },
  {
    tag: "victim_support",
    score: -3,
    action: "allow",
    tests: [
      /\b(help|safe|safety|what should i do|can you help|ho tro|giup|lam gi)\b/i,
      /\b(rape|assault|abuse|hiep dam|xam hai|cuong hiep)\b/i,
    ],
  },
];

export const runInputRuleGuardrail = (normalizedMessage) => {
  const signals = [];

  for (const rule of RULE_DEFINITIONS) {
    const matched = rule.tests.every((test) => test.test(normalizedMessage));
    if (matched) {
      signals.push({
        source: "rule",
        tag: rule.tag,
        score: rule.score,
        action: rule.action,
      });
    }
  }

  return signals;
};
