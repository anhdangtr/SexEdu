const bannedKeywords = ["sex explicit", "rape", "violence"];

export const checkSafety = (message) => {
  const lower = message.toLowerCase();
  return !bannedKeywords.some((word) => lower.includes(word));
};