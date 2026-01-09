"use client";

import { useMiniChat } from "@/contexts/mini-chat-context";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { MiniChatWindow } from "./mini-chat-window";
import { MiniChatBubble } from "./mini-chat-bubble";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function MiniChatContainer() {
  const { openChats, openMiniChat } = useMiniChat();
  const { user } = useAuth();
  const pathname = usePathname();

  // Separate expanded and minimized chats
  const expandedChats = openChats.filter((c) => !c.isMinimized);
  const minimizedChats = openChats.filter((c) => c.isMinimized);

  return (
    <>
      {/* Expanded chat windows */}
      {expandedChats.map((chat, index) => (
        <MiniChatWindow
          key={chat.participantId}
          chat={chat}
          index={index}
        />
      ))}

      {/* Minimized chat bubbles */}
      {minimizedChats.map((chat, index) => (
        <MiniChatBubble
          key={chat.participantId}
          chat={chat}
          index={index}
        />
      ))}

      {/* Floating New Chat Button (visible on all pages except auth) */}
      {user && !pathname.startsWith("/login") && !pathname.startsWith("/register") && (
        <div className="fixed bottom-5 right-5 z-50">
        <NewChatDialog 
          trigger={
            <Button
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transition-all hover:scale-105"
            >
              <Plus className="w-6 h-6" />
            </Button>
          }
          onChatCreated={(chat) => {
            if (!chat.participants || !user?._id) return;
            
            // Find the other participant
            const partner = chat.participants.find(p => String(p._id) !== String(user._id));
            
            if (partner && partner._id) {
               openMiniChat(String(partner._id), { 
                 id: String(partner._id), 
                 name: partner.name, 
                 avatar: partner.avatar 
               });
            }
          }}
        />
      </div>
      )}
    </>
  );
}
