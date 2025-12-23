import type { ChatType, UserType } from "@/lib/chat.types";

/**
 * Lấy người dùng khác trong chat một-một
 */
export function getOtherUserInChat(
  chat: ChatType,
  currentUserId: string | undefined
): UserType | undefined {
  if (chat.isGroup) return undefined;
  return chat.participants.find((p) => p._id !== currentUserId);
}

/**
 * Lấy tên hiển thị của cuộc trò chuyện
 */
export function getChatDisplayName(
  chat: ChatType,
  currentUserId: string | undefined
): string {
  if (chat.isGroup) {
    return chat.groupName || "Cuộc trò chuyện nhóm";
  }
  const otherUser = getOtherUserInChat(chat, currentUserId);
  return otherUser?.name || "Không xác định";
}

/**
 * Format time giống như Messenger (e.g., "2 giờ", "3 ngày", etc.)
 */
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("vi-VN");
}
