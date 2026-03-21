import { callGuardrailClassifier } from "./llm.service.js";

export const REVIEW_DECISIONS = {
  ALLOW: "allow",
  BLOCK: "block",
  REDIRECT: "redirect",
  REVIEW: "review",
};

const DEFAULT_ALLOW_RESULT = {
  decision: REVIEW_DECISIONS.ALLOW,
  reason: "fallback_allow",
};

const sanitizeClassifierResult = (result, fallbackReason) => {
  if (!result || typeof result !== "object") {
    return { ...DEFAULT_ALLOW_RESULT, reason: fallbackReason };
  }

  const decision = String(result.decision || "").toLowerCase();
  const reason = String(result.reason || fallbackReason);

  if (!Object.values(REVIEW_DECISIONS).includes(decision)) {
    return { ...DEFAULT_ALLOW_RESULT, reason: fallbackReason };
  }

  return { decision, reason };
};

export const classifyInputWithAI = async ({ message, normalized, signals, score, mode }) => {
  const result = await callGuardrailClassifier({
    stage: "input",
    payload: {
      message,
      normalized,
      signals,
      score,
      mode,
    },
  });

  return sanitizeClassifierResult(result, "input_uncertain");
};

export const reviewOutputWithAI = async ({ userMessage, assistantReply, intent, score, signals }) => {
  const result = await callGuardrailClassifier({
    stage: "output",
    payload: {
      userMessage,
      assistantReply,
      intent,
      score,
      signals,
    },
  });

  return sanitizeClassifierResult(result, "unsafe_output");
};
