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

export const callLLM = async (message, intent) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is missing. Skipping OpenAI request.");
    return "He thong AI chua duoc cau hinh khoa API. Hay them OPENAI_API_KEY vao backend.";
  }

  try {
    const res = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_CHAT_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are a safe and educational sex education assistant. The detected intent is: ${intent}. Give concise, educational, non-explicit answers focused on health, consent, and safety.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      getRequestConfig(apiKey)
    );

    return res.data.choices[0]?.message?.content ?? "Minh chua nhan duoc noi dung phan hoi tu AI.";
  } catch (err) {
    const status = err.response?.status;
    const apiError = err.response?.data?.error?.message;

    console.error("OpenAI request failed:", status ?? err.code ?? err.message, apiError ?? "");

    if (status === 401) {
      return "Khoa API OpenAI khong hop le hoac da het han. Hay kiem tra OPENAI_API_KEY cua backend.";
    }

    return "AI dang ban hoac chua san sang. Thu lai sau nhe!";
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
          "Block clear unsafe content involving minors and sexual content, coercion with intimacy, or explicit violent sexual harm.",
          "Redirect cases involving partner violence or coercion toward safety-oriented support.",
          "Allow educational, medical, consent, puberty, contraception, and STI questions when not unsafe.",
        ].join(" ")
      : [
          "You are a safety guardrail classifier reviewing an assistant answer.",
          "Return JSON only with keys: decision, reason.",
          'Valid decisions: "allow", "block", "redirect", "review".',
          "Reject outputs that are explicit, unsafe, or give harmful sexual guidance.",
          "Allow concise educational and safety-focused outputs.",
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
