import axios from "axios";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";
const DEFAULT_GUARDRAIL_MODEL = process.env.OPENAI_GUARDRAIL_MODEL || "gpt-4.1-mini";

const getApiKey = () => process.env.OPENAI_API_KEY;

const getRequestConfig = (apiKey, timeout = 15000) => ({
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  timeout,
});

const parseClassifierResponse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const SENSITIVE_INTENTS = new Set([
  "support_or_safety",
  "sexual_explicit_request",
  "harmful_request",
]);

const RESPONSE_FORMAT_RULES = [
  "Format every answer in clean Markdown that is easy to scan on mobile.",
  "Use short paragraphs with blank lines between sections.",
  "Use short section headers like **Possible Reasons**, **What To Do Now**, or **Get Help Now** when useful.",
  "Use bullet lists for warning signs, common causes, and next steps.",
  "Keep each bullet focused on one idea.",
  "Do not use emojis.",
  "Do not write long dense paragraphs.",
].join(" ");

const SYMPTOM_RESPONSE_RULES = [
  "For symptom or body-change questions, use this structure when relevant:",
  "1. one brief reassuring sentence with uncertainty",
  "2. a short **Possible Reasons** section",
  "3. a short **When To Be Careful** or **Get Help Now** section if warning signs exist",
  "4. a short **What You Can Do Now** section",
  "5. end with at most 2 or 3 relevant follow-up questions",
].join(" ");

const buildSystemPrompt = (intent) => {
  if (!SENSITIVE_INTENTS.has(intent)) {
    return [
      "You are a safe and educational sex education assistant.",
      `Treat the likely intent as: ${intent}.`,
      "Answer concisely in a factual, non-graphic, educational way.",
      "Focus on health, consent, safety, prevention, and emotional support when relevant.",
      "If the user asks something unsafe, refuse briefly and redirect to safe education.",
      RESPONSE_FORMAT_RULES,
      SYMPTOM_RESPONSE_RULES,
    ].join(" ");
  }

  return [
    "You are a safe and educational sex education assistant handling a sensitive request.",
    `Treat the likely intent as: ${intent}.`,
    "Before answering, silently classify the request into one of these buckets: education, support_or_safety, sexual_explicit_request, harmful_request, unclear.",
    "If the request is education, answer clearly in a concise and educational way.",
    "If the request is support_or_safety, answer supportively, prioritize immediate safety, medical care, trusted support, and non-judgmental guidance.",
    "If the request is sexual_explicit_request, do not provide erotic or graphic detail; instead redirect to health, consent, boundaries, and safety.",
    "If the request is harmful_request, refuse briefly and redirect to consent, safety, and respect.",
    "If the request is unclear, answer briefly in a safe, non-explicit way.",
    "Never provide instructions for rape, coercion, abuse, sexual exploitation, or avoiding accountability.",
    "Do not be sexually graphic. Keep the answer focused on health, consent, safety, and age-appropriate education.",
    "If the user appears to be a victim or asks what to do after assault or abuse, do not refuse. Offer supportive, practical, safety-focused guidance.",
    RESPONSE_FORMAT_RULES,
    SYMPTOM_RESPONSE_RULES,
  ].join(" ");
};

export const callLLM = async (message, intent) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is missing. Skipping OpenAI request.");
    return "The AI system is not configured with an API key yet. Please add OPENAI_API_KEY to the backend.";
  }

  try {
    const systemPrompt = buildSystemPrompt(intent);

    const res = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_CHAT_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      getRequestConfig(apiKey)
    );

    return res.data.choices[0]?.message?.content ?? "I did not receive a response from the AI.";
  } catch (err) {
    const status = err.response?.status;
    const apiError = err.response?.data?.error?.message;

    console.error("OpenAI request failed:", status ?? err.code ?? err.message, apiError ?? "");

    if (status === 401) {
      return "The OpenAI API key is invalid or expired. Please check the backend OPENAI_API_KEY.";
    }

    return "The AI is busy or temporarily unavailable. Please try again shortly.";
  }
};

export const callGuardrailClassifier = async ({ stage, payload }) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  const systemPrompt =
    stage === "input"
      ? [
          "You are a safety guardrail classifier for sex education.",
          "Return JSON only with keys: decision, reason.",
          'Valid decisions: "allow", "block", "redirect", "review".',
          "Block only clear harmful requests involving minors and sexual content, coercion for sexual access, rape instructions, or avoiding evidence/accountability.",
          "Allow and do not block victim-support requests such as asking what to do after rape, assault, abuse, or coercion.",
          "Redirect explicit erotic sexual requests toward safe educational framing.",
          "Allow educational, medical, consent, puberty, contraception, STI, pregnancy, and safety questions when they are not harmful.",
        ].join(" ")
      : [
          "You are a safety guardrail classifier reviewing an assistant answer.",
          "Return JSON only with keys: decision, reason.",
          'Valid decisions: "allow", "block", "redirect", "review".',
          "Reject outputs that are sexually graphic, unsafe, or give harmful sexual guidance.",
          "Allow concise educational outputs and supportive victim-safety guidance even when they mention rape or assault in a non-graphic way.",
        ].join(" ");

  try {
    const res = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_GUARDRAIL_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      },
      getRequestConfig(apiKey, 10000)
    );

    const content = res.data.choices[0]?.message?.content ?? "";
    return parseClassifierResponse(content);
  } catch (err) {
    console.error(
      `OpenAI guardrail ${stage} review failed:`,
      err.response?.status ?? err.code ?? err.message
    );
    return null;
  }
};
