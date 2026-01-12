"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import type { MessageType } from "@/lib/chat.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Reply, MoreVertical, RotateCcw, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { chatAPI } from "@/services/chatService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  message: MessageType;
  onReply?: (message: MessageType) => void;
  onRecall?: (messageId: string) => void;
}

export default function ChatMessageItem({ message, onReply, onRecall }: Props) {
  const { currentUser, retryMessage } = useChat();
  const [isRecalling, setIsRecalling] = useState(false);
  
  // Compare as strings to handle number/string ID mismatch
  const isCurrentUser = String(currentUser?._id) === String(message.sender._id);
  const isTempMessage = message._id?.startsWith("temp_");
  
  // Check if message is within 5 minutes (can recall)
  const messageTime = new Date(message.createdAt).getTime();
  const now = Date.now();
  const fiveMinutesMs = 5 * 60 * 1000;
  const isWithin5Minutes = (now - messageTime) <= fiveMinutesMs;
  
  const canRecall =
    isCurrentUser &&
    !isTempMessage &&
    !message.isRecalled &&
    message.status !== "sending" &&
    message.status !== "failed" &&
    isWithin5Minutes;
  const canReply = onReply && !message.isRecalled && message.status !== "sending";
  const canRetry = isCurrentUser && message.status === "failed";

  // Show dropdown only if there are options
  const hasDropdownOptions = canRecall || canReply;

  const imageSrc = message.image || message.localImagePreview;
  const isLocalImage =
    imageSrc?.startsWith("data:") || imageSrc?.startsWith("blob:");

  const handleRecall = async () => {
    if (!message._id || isRecalling) return;
    
    setIsRecalling(true);
    try {
      await chatAPI.recallMessage(message._id);
      if (onRecall) onRecall(message._id);
    } catch (error) {
      console.error("Failed to recall message:", error);
    } finally {
      setIsRecalling(false);
    }
  };

  const handleReply = () => {
    if (onReply && !message.isRecalled) {
      onReply(message);
    }
  };

  const handleRetry = () => {
    if (canRetry) {
      retryMessage(message);
    }
  };

  // Display recalled message differently
  if (message.isRecalled) {
    return (
      <div className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-xs ${isCurrentUser ? "order-2" : "order-1"}`}>
          {!isCurrentUser && (
            <p className="text-xs text-gray-600 mb-1">{message.sender.name}</p>
          )}
          <div className="p-3 rounded-lg bg-gray-100 border border-dashed border-gray-300">
            <p className="text-sm text-gray-400 italic">
              <RotateCcw className="inline w-3 h-3 mr-1" />
              Tin nhắn đã bị thu hồi
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 group ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs ${isCurrentUser ? "order-2" : "order-1"}`}>
        {!isCurrentUser && (
          <p className="text-xs text-gray-600 mb-1">{message.sender.name}</p>
        )}

        <div className="flex items-center gap-1">
          {canRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500"
              onClick={handleRetry}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          )}
          {/* Actions menu - shown on hover */}
          {hasDropdownOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canReply && (
                  <DropdownMenuItem onClick={handleReply}>
                    <Reply className="h-4 w-4 mr-2" />
                    Trả lời
                  </DropdownMenuItem>
                )}
                {canRecall && (
                  <DropdownMenuItem onClick={handleRecall} disabled={isRecalling}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isRecalling ? "Đang thu hồi..." : "Thu hồi"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div
            className={`p-3 rounded-lg ${
              isCurrentUser
                ? "bg-orange-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-900 rounded-bl-none"
            } ${message.status === "sending" ? "opacity-70" : ""} ${
              message.status === "failed" ? "border border-red-500" : ""
            }`}
          >
            {message.replyTo && (
              <div className="mb-2 p-2 border-l-2 border-current opacity-70 text-xs italic">
                <p>Trả lời: {message.replyTo.sender.name}</p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}

            {imageSrc && (
              <div className="mb-2">
                {isLocalImage ? (
                  <img
                    src={imageSrc}
                    alt="Message image"
                    className="rounded max-h-64"
                  />
                ) : (
                  <Image
                    src={imageSrc}
                    alt="Message image"
                    width={200}
                    height={200}
                    className="rounded max-h-64"
                  />
                )}
              </div>
            )}

            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          {isCurrentUser && message.status === "sending" && (
            <span>Đang gửi...</span>
          )}
          {isCurrentUser && message.status === "sent" && (
            <span className="text-green-600">Đã gửi</span>
          )}
        </div>
        {message.status === "failed" && (
          <div className="mt-1 text-xs text-red-500">
            {message.errorMessage || "Gửi tin nhắn thất bại"}
          </div>
        )}
      </div>
    </div>
  );
}
