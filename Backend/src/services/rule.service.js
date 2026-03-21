import { normalizeText } from "../utils/text.util.js";

const RULE_RESPONSES = [
  {
    test: (message) => message.includes("tranh thai"),
    reply:
      "Ban co the su dung bao cao su hoac tham khao cac bien phap tranh thai phu hop voi tinh trang suc khoe cua minh de phong tranh mang thai ngoai y muon.",
  },
  {
    test: (message) => message.includes("an toan"),
    reply:
      "Quan he an toan bao gom su dong thuan, ton trong, bien phap bao ve va hieu ro cac nguy co lien quan den suc khoe sinh san.",
  },
  {
    test: (message) => message.includes("day thi"),
    reply:
      "Day thi la giai doan co the va noi tiet thay doi de chuyen dan sang truong thanh. Thuong se co thay doi ve chieu cao, cam xuc, hoc mon va co quan sinh duc.",
  },
];

export const getRuleResponse = (message) => {
  const normalized = normalizeText(message);
  const match = RULE_RESPONSES.find((rule) => rule.test(normalized));
  return match?.reply ?? null;
};
