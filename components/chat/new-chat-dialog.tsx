"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { ChatType } from "@/lib/chat.types";
import friendRequestService from "@/services/friendRequestService";
import authService from "@/services/authService";

interface Props {
  onChatCreated?: (chat: ChatType) => void;
  trigger?: React.ReactNode;
}

export function NewChatDialog({ onChatCreated, trigger }: Props) {
  const { createChat } = useChat();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch friends when dialog opens
  useEffect(() => {
    if (open) {
      const fetchFriends = async () => {
        setIsLoading(true);
        try {
          const currentUser = authService.getCurrentUser();
          if (!currentUser) return;
          
          const response = await friendRequestService.getUserFriends(currentUser.id, 0, 50); // Fetch first 50 friends
          if (response.code === "0000" && response.data) {
            setFriends(response.data.content || []);
          }
        } catch (error) {
          console.error("Failed to fetch friends:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFriends();
    }
  }, [open]);

  const filteredUsers = friends.filter((friend) =>
    friend.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async () => {
    if (!selectedUserId) return;

    setIsCreating(true);
    try {
      const newChat = await createChat({
        participantId: selectedUserId,
      });

      if (newChat && newChat._id) {
        onChatCreated?.(newChat);
        setOpen(false);
        setSelectedUserId(null);
        setSearchTerm("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          variant="ghost"
          className="rounded-full hover:bg-white/50"
          title="Tin nhắn mới"
        >
          <Plus className="w-6 h-6 text-orange-600" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tin nhắn mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Tìm kiếm bạn bè..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* User List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Không tìm thấy bạn bè" : "Bạn chưa kết bạn với ai"}
                </div>
              ) : (
                filteredUsers.map((friend) => (
                  <button
                    key={friend.userId}
                    onClick={() => setSelectedUserId(String(friend.userId))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedUserId === String(friend.userId)
                        ? "bg-orange-100 border border-orange-500"
                        : "hover:bg-gray-100 border border-transparent"
                      }`}
                  >
                    {friend.userAvatar ? (
                      <Image
                        src={friend.userAvatar}
                        alt={friend.userName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                        {friend.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{friend.userName}</p>
                      <p className="text-xs text-gray-500">{friend.userCity || "Bạn bè"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateChat}
                disabled={!selectedUserId || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo cuộc trò chuyện"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
