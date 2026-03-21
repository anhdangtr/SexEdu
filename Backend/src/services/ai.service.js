import { evaluateInputGuardrail, evaluateOutputGuardrail } from "./guardrail.service.js";
import { callLLM } from "./llm.service.js";
import { detectIntent } from "../utils/intent.util.js";

const finalizeReply = async ({ userMessage, reply, source, intent }) => {
  const outputReview = await evaluateOutputGuardrail({
    userMessage,
    assistantReply: reply,
    source,
    intent,
  });

  if (outputReview.decision !== "allow") {
    return outputReview.safeReply;
  }

  return reply;
};

export const processMessage = async (message, mode) => {
  const trimmedMessage = String(message ?? "").trim();
  if (!trimmedMessage) {
    return "Please enter a question before sending.";
  }

  const intent = detectIntent(trimmedMessage);
  const inputReview = await evaluateInputGuardrail(trimmedMessage, { mode, intent });

  if (inputReview.decision === "block" || inputReview.decision === "redirect") {
    return inputReview.safeReply;
  }

  const llmReply = await callLLM(trimmedMessage, intent);
  return finalizeReply({
    userMessage: trimmedMessage,
    reply: llmReply,
    source: "llm",
    intent,
  });
};
