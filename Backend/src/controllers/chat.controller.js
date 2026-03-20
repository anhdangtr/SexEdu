import { processMessage } from "../services/ai.service.js";

export const handleChat = async (req, res) => {
  try {
    const { message, mode } = req.body;

    const response = await processMessage(message, mode);

    res.json({ reply: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};