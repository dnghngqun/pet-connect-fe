"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import type { ChatType } from "@/lib/chat.types";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { chatAPI } from "@/services/chatService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getOtherParticipant(chat: ChatType, currentUserId: string | undefined) {
  if (chat.isGroup) return null;
  return chat.participants.find((p) => String(p._id) !== String(currentUserId));
}

function getChatDisplayName(
  chat: ChatType,
  currentUserId: string | undefined
): string {
  if (chat.isGroup) {
    return chat.groupName || "Cuộc trò chuyện nhóm";
  }
  const otherUser = getOtherParticipant(chat, currentUserId);
  return otherUser?.name || "Không xác định";
}

export function ChatHeader() {
  const { currentChat, isMessagesLoading, currentUser, fetchAllChats } = useChat();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConversation = async () => {
    if (!currentChat?._id || isDeleting) return;

    setIsDeleting(true);
    try {
      await chatAPI.deleteConversation(currentChat._id);
      await fetchAllChats();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="border-b bg-white p-4 flex items-center justify-center h-20">
        <p className="text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const displayName = getChatDisplayName(currentChat, currentUser?._id);
  const otherUser = getOtherParticipant(currentChat, currentUser?._id);

  return (
    <>
      <div className="border-b bg-white p-4 flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          {otherUser?.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.name || "User"}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{displayName}</h2>
            {otherUser && (
              <p className="text-xs text-gray-500">
                {otherUser.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMessagesLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đoạn chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện với {displayName}? 
              Tất cả tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
