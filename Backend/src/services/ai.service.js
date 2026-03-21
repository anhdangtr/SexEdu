import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { evaluateInputGuardrail, evaluateOutputGuardrail } from "./guardrail.service.js";
import { getRuleResponse } from "./rule.service.js";
import { callLLM } from "./llm.service.js";
import { detectIntent } from "../utils/intent.util.js";
import { normalizeText } from "../utils/text.util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const knowledge = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/knowledge.json"), "utf-8")
);

const findKnowledgeMatch = (message) => {
  const normalized = normalizeText(message);
  return knowledge.find((item) => normalized.includes(normalizeText(item.topic)));
};

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
    return "Hay nhap noi dung cau hoi truoc khi gui.";
  }

  const intent = detectIntent(trimmedMessage);
  const inputReview = await evaluateInputGuardrail(trimmedMessage, { mode, intent });

  if (inputReview.decision === "block" || inputReview.decision === "redirect") {
    return inputReview.safeReply;
  }

  const kbMatch = findKnowledgeMatch(trimmedMessage);
  if (kbMatch) {
    return kbMatch.content;
  }

  const ruleReply = getRuleResponse(trimmedMessage);
  if (ruleReply) {
    return ruleReply;
  }

  const llmReply = await callLLM(trimmedMessage, intent);
  return finalizeReply({
    userMessage: trimmedMessage,
    reply: llmReply,
    source: "llm",
    intent,
  });
};
