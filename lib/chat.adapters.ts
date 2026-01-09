import type { ConversationRow, ChatType } from "./chat.types";

// Helpers to normalize DB conversation rows and convert between numeric/string ids.

export const normalizeConversationRow = (
  row: ConversationRow
): {
  id: string;
  user_one_id: string;
  user_two_id: string;
  last_message_id: string | null;
  updated_at: string;
} => {
  const asString = (v: number | string | null | undefined) =>
    v === null || v === undefined ? null : String(v);

  return {
    id: String(row.id),
    user_one_id: String(row.user_one_id),
    user_two_id: String(row.user_two_id),
    last_message_id: asString(row.last_message_id),
    updated_at: row.updated_at,
  };
};

// If you need to persist a ChatType -> ConversationRow, implement a best-effort mapper here.
// Note: ChatType has rich participant objects; the DB row stores only two user IDs.
export const conversationRowFromChat = (chat: ChatType): ConversationRow => {
  const participants = chat.participants || [];
  const userOne = participants[0]?._id ?? "";
  const userTwo = participants[1]?._id ?? participants[0]?._id ?? "";

  return {
    id: String(chat._id),
    user_one_id: String(userOne),
    user_two_id: String(userTwo),
    last_message_id: chat.lastMessage ? String(chat.lastMessage._id) : null,
    updated_at: chat.updatedAt,
  };
};

// Small utility: detect if an id string is numeric-only (so it could map to BIGINT)
export const isNumericId = (id?: string | number | null) => {
  if (id === null || id === undefined) return false;
  return /^\d+$/.test(String(id));
};

export default {
  normalizeConversationRow,
  conversationRowFromChat,
  isNumericId,
};
