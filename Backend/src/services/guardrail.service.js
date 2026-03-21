import { runInputRuleGuardrail } from "./guardrailRule.service.js";
import {
  classifyInputWithAI,
  reviewOutputWithAI,
  REVIEW_DECISIONS,
} from "./guardrailAI.service.js";
import { getGuardrailCache, setGuardrailCache } from "./guardrailCache.service.js";
import { normalizeText } from "../utils/text.util.js";

const INPUT_REVIEW_THRESHOLD = 2;
const INPUT_BLOCK_THRESHOLD = 4;
const OUTPUT_REVIEW_THRESHOLD = 2;

const KEYWORD_PATTERNS = [
  { pattern: /\bhow to rape\b/i, score: 5, tag: "harmful_sexual_violence", action: "block" },
  { pattern: /\brape someone\b/i, score: 5, tag: "harmful_sexual_violence", action: "block" },
  { pattern: /\bforce someone to have sex\b/i, score: 5, tag: "harmful_sexual_violence", action: "block" },
  { pattern: /\bhide rape evidence\b/i, score: 5, tag: "harmful_sexual_violence", action: "block" },
  { pattern: /\bchild porn\b/i, score: 5, tag: "minor_sexual", action: "block" },
  { pattern: /\bunderage porn\b/i, score: 5, tag: "minor_sexual", action: "block" },
  { pattern: /\brape\b/i, score: 2, tag: "sexual_violence_context", action: "review" },
  { pattern: /\bsexual assault\b/i, score: 2, tag: "sexual_violence_context", action: "review" },
  { pattern: /\bmolest/i, score: 2, tag: "sexual_violence_context", action: "review" },
  { pattern: /\bunderage\b/i, score: 3, tag: "minor_signal", action: "review" },
  { pattern: /\bminor\b/i, score: 2, tag: "minor_signal", action: "review" },
  { pattern: /\bteen\b/i, score: 1, tag: "minor_signal", action: "review" },
  { pattern: /\bchild\b/i, score: 3, tag: "minor_signal", action: "review" },
  { pattern: /\bkid\b/i, score: 2, tag: "minor_signal", action: "review" },
  { pattern: /\bcoerc/i, score: 3, tag: "coercion_signal", action: "review" },
  { pattern: /\bforced?\b/i, score: 3, tag: "coercion_signal", action: "review" },
  { pattern: /\bviolence\b/i, score: 2, tag: "violence_signal", action: "review" },
  { pattern: /\bhit\b/i, score: 1, tag: "violence_signal", action: "review" },
  { pattern: /\bexplicit\b/i, score: 2, tag: "explicit_signal", action: "review" },
  { pattern: /\bsex\b/i, score: 1, tag: "sexual_context", action: "review" },
  { pattern: /\bintim/i, score: 1, tag: "sexual_context", action: "review" },
  { pattern: /\bquan he\b/i, score: 1, tag: "sexual_context", action: "review" },
];

const SAFE_REDIRECT_MESSAGES = {
  minor_sexual:
    "I can't help with sexual content involving minors. If you need safe, age-appropriate sex education information, I can explain it in a scientific and appropriate way.",
  coercion_intimacy:
    "I can't help with content involving coercion or forced intimacy. If you are in an unsafe situation, please reach out to a trusted person or an emergency support service in your area.",
  partner_violence:
    "I can't provide guidance that involves violence in a relationship. If you are in danger, please prioritize your safety and seek help from someone you trust, local services, or an emergency hotline.",
  harmful_sexual_violence:
    "I can't help with requests involving coercion or sexual violence. If you want information about consent, safety, or how to get help, I can support that.",
  explicit_sexual_content:
    "I can't help with sexual content that goes beyond safe educational limits. I can still help from a health, consent, and safety perspective.",
  victim_support:
    "If you are dealing with assault or an unsafe situation, please get to a safe place, reach out to someone you trust, and contact medical or emergency support in your area if needed.",
  unsafe:
    "This question is not appropriate to answer in its current form. Please ask it in a safer, more educational, and respectful way.",
};

const OUTPUT_REDIRECT_MESSAGES = {
  unsafe_output:
    "I'll answer in a safer way. You can also ask again using a more educational, respectful, and health-focused framing.",
};

const buildKeywordSignals = (message) => {
  const matches = [];

  for (const rule of KEYWORD_PATTERNS) {
    if (rule.pattern.test(message)) {
      matches.push({
        source: "keyword",
        tag: rule.tag,
        score: rule.score,
        action: rule.action,
      });
    }
  }

  return matches;
};

const sumRisk = (signals) => signals.reduce((total, signal) => total + signal.score, 0);

const hasHardBlock = (signals) => signals.some((signal) => signal.action === "block");
const hasVictimSupportSignal = (signals) => signals.some((signal) => signal.tag === "victim_support");

const buildResult = ({
  decision,
  reason,
  score,
  signals = [],
  usedAI = false,
  safeReply = null,
  cacheHit = false,
}) => ({
  decision,
  reason,
  score,
  signals,
  usedAI,
  safeReply,
  cacheHit,
});

export const evaluateInputGuardrail = async (message, context = {}) => {
  const normalized = normalizeText(message);
  const cached = getGuardrailCache(`input:${normalized}`);
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const keywordSignals = buildKeywordSignals(normalized);
  const ruleSignals = runInputRuleGuardrail(normalized, context);
  const signals = [...keywordSignals, ...ruleSignals];
  const score = sumRisk(signals);

  let result;

  if (hasHardBlock(signals)) {
    const hardSignal = signals.find((signal) => signal.action === "block") ?? signals[0];
    result = buildResult({
      decision: "block",
      reason: hardSignal?.tag ?? "unsafe",
      score,
      signals,
      safeReply: SAFE_REDIRECT_MESSAGES[hardSignal?.tag] ?? SAFE_REDIRECT_MESSAGES.unsafe,
    });
  } else if (hasVictimSupportSignal(signals)) {
    result = buildResult({
      decision: "allow",
      reason: "victim_support",
      score,
      signals,
    });
  } else if (score >= INPUT_BLOCK_THRESHOLD && context.intent === "harmful_request") {
    result = buildResult({
      decision: "block",
      reason: "harmful_sexual_violence",
      score,
      signals,
      safeReply: SAFE_REDIRECT_MESSAGES.harmful_sexual_violence,
    });
  } else if (score < INPUT_REVIEW_THRESHOLD) {
    result = buildResult({
      decision: "allow",
      reason: "low_risk",
      score,
      signals,
    });
  } else {
    const aiReview = await classifyInputWithAI({
      message,
      normalized,
      signals,
      score,
      mode: context.mode,
    });

    if (aiReview.decision === REVIEW_DECISIONS.BLOCK) {
      result = buildResult({
        decision: "block",
        reason: aiReview.reason,
        score,
        signals,
        usedAI: true,
        safeReply: SAFE_REDIRECT_MESSAGES[aiReview.reason] ?? SAFE_REDIRECT_MESSAGES.unsafe,
      });
    } else if (aiReview.decision === REVIEW_DECISIONS.REDIRECT) {
      result = buildResult({
        decision: "redirect",
        reason: aiReview.reason,
        score,
        signals,
        usedAI: true,
        safeReply: SAFE_REDIRECT_MESSAGES[aiReview.reason] ?? SAFE_REDIRECT_MESSAGES.unsafe,
      });
    } else if (aiReview.decision === REVIEW_DECISIONS.REVIEW) {
      result = buildResult({
        decision: "redirect",
        reason: aiReview.reason,
        score,
        signals,
        usedAI: true,
        safeReply: SAFE_REDIRECT_MESSAGES[aiReview.reason] ?? SAFE_REDIRECT_MESSAGES.unsafe,
      });
    } else {
      result = buildResult({
        decision: "allow",
        reason: aiReview.reason ?? "ai_allow",
        score,
        signals,
        usedAI: true,
      });
    }
  }

  setGuardrailCache(`input:${normalized}`, result);
  return result;
};

export const evaluateOutputGuardrail = async ({ userMessage, assistantReply, source = "llm", intent = "general" }) => {
  if (source !== "llm") {
    return buildResult({
      decision: "allow",
      reason: "trusted_source",
      score: 0,
    });
  }

  const normalizedReply = normalizeText(assistantReply);
  const outputSignals = buildKeywordSignals(normalizedReply);
  const score = sumRisk(outputSignals);

  if (hasHardBlock(outputSignals) && intent !== "support_or_safety" && intent !== "education") {
    const hardSignal = outputSignals.find((signal) => signal.action === "block");
    return buildResult({
      decision: "redirect",
      reason: hardSignal?.tag ?? "unsafe_output",
      score,
      signals: outputSignals,
      safeReply: OUTPUT_REDIRECT_MESSAGES.unsafe_output,
    });
  }

  if (score < OUTPUT_REVIEW_THRESHOLD) {
    return buildResult({
      decision: "allow",
      reason: "low_risk_output",
      score,
      signals: outputSignals,
    });
  }

  const aiReview = await reviewOutputWithAI({
    userMessage,
    assistantReply,
    intent,
    score,
    signals: outputSignals,
  });

  if (aiReview.decision === REVIEW_DECISIONS.ALLOW) {
    return buildResult({
      decision: "allow",
      reason: aiReview.reason ?? "ai_allow_output",
      score,
      signals: outputSignals,
      usedAI: true,
    });
  }

  return buildResult({
    decision: "redirect",
    reason: aiReview.reason ?? "unsafe_output",
    score,
    signals: outputSignals,
    usedAI: true,
    safeReply: OUTPUT_REDIRECT_MESSAGES.unsafe_output,
  });
};
