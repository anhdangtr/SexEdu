import { checkSafety } from "./guardrail.service.js";
import { getRuleResponse } from "./rule.service.js";
import { callLLM } from "./llm.service.js";
import { detectIntent } from "../utils/intent.util.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const knowledge = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/knowledge.json"), "utf-8")
);

export const processMessage = async (message, mode) => {

  // 🛡 Guardrail
  const isSafe = checkSafety(message);
  if (!isSafe) {
    return "Câu hỏi này không phù hợp. Hãy hỏi theo cách an toàn hơn.";
  }

  // 🎯 Intent detection
  const intent = detectIntent(message);

  // 📚 Knowledge base
  const kbMatch = knowledge.find((item) =>
    message.toLowerCase().includes(item.topic)
  );
  if (kbMatch) {
    return kbMatch.content;
  }

  // ⚙️ Rule-based
  const rule = getRuleResponse(message);
  if (rule) return rule;

  // 🤖 LLM fallback
  return await callLLM(message, intent);
};