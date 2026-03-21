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
  { pattern: /\brape\b/i, score: 4, tag: "sexual_violence_explicit", action: "block" },
  { pattern: /\bsexual assault\b/i, score: 4, tag: "sexual_violence_explicit", action: "block" },
  { pattern: /\bmolest/i, score: 4, tag: "sexual_violence_explicit", action: "block" },
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
    "Minh khong the ho tro noi dung tinh duc lien quan den tre vi thanh nien. Neu ban can thong tin giao duc gioi tinh an toan, minh co the giai thich o muc do phu hop va khoa hoc.",
  coercion_intimacy:
    "Minh khong the ho tro noi dung lien quan den ep buoc trong su than mat. Neu ban dang o tinh huong khong an toan, hay tim nguoi dang tin cay hoac dich vu ho tro khan cap tai noi ban song.",
  partner_violence:
    "Minh khong the huong dan noi dung co yeu to bao luc trong moi quan he. Neu ban dang gap nguy hiem, hay uu tien an toan va tim ho tro tu nguoi than, co quan dia phuong hoac duong day khan cap.",
  explicit_sexual_content:
    "Minh khong the ho tro noi dung tinh duc qua muc an toan. Minh co the giup theo huong giao duc suc khoe, dong thuan va an toan.",
  unsafe:
    "Cau hoi nay khong phu hop de tra loi theo cach hien tai. Hay hoi theo huong giao duc, an toan va ton trong hon.",
};

const OUTPUT_REDIRECT_MESSAGES = {
  unsafe_output:
    "Minh se tra loi theo huong an toan hon. Ban co the hoi lai theo cach giao duc, ton trong va tap trung vao suc khoe.",
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

  if (hasHardBlock(signals) || score >= INPUT_BLOCK_THRESHOLD) {
    const hardSignal = signals.find((signal) => signal.action === "block") ?? signals[0];
    result = buildResult({
      decision: "block",
      reason: hardSignal?.tag ?? "unsafe",
      score,
      signals,
      safeReply: SAFE_REDIRECT_MESSAGES[hardSignal?.tag] ?? SAFE_REDIRECT_MESSAGES.unsafe,
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

  if (hasHardBlock(outputSignals)) {
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
