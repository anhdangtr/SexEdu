import axios from "axios";

export const callLLM = async (message, intent) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is missing. Skipping OpenAI request.");
    return "He thong AI chua duoc cau hinh khoa API. Hay them OPENAI_API_KEY vao backend.";
  }

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a safe and educational sex education assistant. The detected intent is: ${intent}.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
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
