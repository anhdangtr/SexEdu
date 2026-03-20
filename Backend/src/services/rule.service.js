export const getRuleResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes("tránh thai")) {
    return "Bạn có thể sử dụng bao cao su hoặc thuốc tránh thai để phòng tránh mang thai ngoài ý muốn.";
  }

  if (lower.includes("an toàn")) {
    return "Quan hệ an toàn bao gồm việc sử dụng biện pháp bảo vệ và sự đồng thuận từ cả hai phía.";
  }

  return null;
};