"use client";

import { useChat } from "@/hooks/useChat";
import type { MessageType } from "@/lib/chat.types";
import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";

interface Props {
  onReplyCancel?: () => void;
  replyTo?: MessageType | null;
}

export function ChatFooter({ onReplyCancel, replyTo }: Props) {
  const { sendMessage, isSendingMessage, selectedChatId } = useChat();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file ảnh (jpg, png, gif...)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!selectedChatId) return;
    if (!content.trim() && !image) return;
    if (isSendingMessage) return;

    await sendMessage({
      chatId: selectedChatId,
      content: content.trim() || undefined,
      image: image || undefined,
      replyToId: replyTo?._id,
    });

    setContent("");
    handleRemoveImage();
    onReplyCancel?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 border-t bg-white p-4 space-y-3">
      {replyTo && (
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded border-l-4 border-blue-500">
          <div className="text-sm">
            <p className="font-semibold text-gray-700">{replyTo.sender.name}</p>
            <p className="text-gray-600 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onReplyCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {image && (
        <div className="relative w-fit">
          <Image
            src={image}
            alt="Preview"
            width={100}
            height={100}
            className="h-20 rounded"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          ref={imageInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          size="icon"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          disabled={isSendingMessage}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSendingMessage}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isSendingMessage || (!content.trim() && !image)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
