export const detectIntent = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes("mang thai")) return "pregnancy";
  if (lower.includes("an toàn")) return "safety";

  return "general";
};