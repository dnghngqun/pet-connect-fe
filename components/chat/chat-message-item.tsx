"use client";

import { useAuth } from "@/hooks/useAuth";
import type { MessageType } from "@/lib/chat.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Reply } from "lucide-react";
import Image from "next/image";

interface Props {
  message: MessageType;
  onReply?: (message: MessageType) => void;
}

export default function ChatMessageItem({ message, onReply }: Props) {
  const { user } = useAuth();
  const isCurrentUser = user?._id === message.sender._id;

  return (
    <div className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs ${isCurrentUser ? "order-2" : "order-1"}`}>
        {!isCurrentUser && (
          <p className="text-xs text-gray-600 mb-1">{message.sender.name}</p>
        )}

        <div
          className={`p-3 rounded-lg ${
            isCurrentUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          {message.replyTo && (
            <div className="mb-2 p-2 border-l-2 border-current opacity-70 text-xs italic">
              <p>Trả lời: {message.replyTo.sender.name}</p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {message.image && (
            <div className="mb-2">
              <Image
                src={message.image}
                alt="Message image"
                width={200}
                height={200}
                className="rounded max-h-64"
              />
            </div>
          )}

          {message.content && (
            <p className="text-sm break-words">{message.content}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          {message.status === "sending" && <span>Đang gửi...</span>}
          {message.status === "failed" && (
            <span className="text-red-500">Lỗi</span>
          )}
        </div>
      </div>

      {onReply && (
        <button
          onClick={() => onReply(message)}
          className="self-center opacity-0 hover:opacity-100 transition-opacity"
          title="Trả lời"
        >
          <Reply className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
