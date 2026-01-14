'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ChatUser {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

interface ChatPet {
  id: number;
  name: string;
  avatarUrl?: string;
  ownerId: number;
}

interface ChatContextType {
  isOpen: boolean;
  activeConversationId: number | null;
  recipient: ChatUser | ChatPet | null;
  recipientType: 'USER' | 'PET';
  openChat: (id: number, type: 'USER' | 'PET', recipientData: ChatUser | ChatPet) => void;
  startChatWithUser: (userId: number, user: ChatUser) => Promise<void>;
  closeChat: () => void;
  minimizeChat: () => void;
  isMinimized: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [recipient, setRecipient] = useState<ChatUser | ChatPet | null>(null);
  const [recipientType, setRecipientType] = useState<'USER' | 'PET'>('USER');

  // Initialize Global WebSocket Connection
  useEffect(() => {
    // Only on client side
    if (typeof window === 'undefined') return;

    const connectGlobalWS = async () => {
        // Dynamic import to avoid SSR issues with some libs if any, though authService is safe.
        // Also to ensure we only run this in effect.
        const { chatAPI } = await import('@/services/chatService');
        const authService = (await import('@/services/authService')).default;

        const user = authService.getCurrentUser();
        if (user && user.token) {
            console.log('ChatContext: Initializing Global WebSocket Connection...');
            chatAPI.connectWebSocket(
                user.token,
                (message) => {
                    // Global message handler if needed
                    // Individual components (MiniChat) will subscribe via chatAPI.addMessageListener
                    // console.log('Global WS Message:', message);
                },
                (notification) => {
                     // Notification handler if needed
                     // console.log('Global WS Notification:', notification);
                },
                (error) => {
                    console.error('Global WS Error:', error);
                }
            );
        }
    };

    connectGlobalWS();

    // Cleanup on unmount
    return () => {
        import('@/services/chatService').then(({ chatAPI }) => {
            console.log('ChatContext: Disconnecting Global WebSocket...');
            chatAPI.disconnectWebSocket();
        });
    };
  }, []); // Run once on mount

  const openChat = useCallback((id: number, type: 'USER' | 'PET', recipientData: ChatUser | ChatPet) => {
    // If opening the same chat, just maximize it
    if (recipient && 
        ((type === 'USER' && (recipient as ChatUser).id === (recipientData as ChatUser).id) || 
         (type === 'PET' && (recipient as ChatPet).id === (recipientData as ChatPet).id))) {
      setIsOpen(true);
      setIsMinimized(false);
      return;
    }

    setRecipientType(type);
    setRecipient(recipientData);
    // TODO: Determine conversationId by calling backend if needed, or pass it in
    // For now set to null or assume passed
    // Typically you'd call an API here to get/create conversation ID based on recipient
    setActiveConversationId(id); 
    setIsOpen(true);
    setIsMinimized(false);
  }, [recipient]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveConversationId(null);
    setRecipient(null);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
    setIsOpen(false); // Visually "closed" but state kept? Or maybe just minimized state.
    // Let's treat minimized as Open but Minimized
    setIsOpen(true); 
  }, []);

  const startChatWithUser = useCallback(async (userId: number, user: ChatUser) => {
    try {
        const { chatAPI } = await import('@/services/chatService');
        // Try to create (or get existing) conversation
        const conversation = await chatAPI.createChat({ participantId: String(userId) });
        
        // Open the chat
        openChat(Number(conversation.id), 'USER', user);
    } catch (error) {
        console.error('Failed to start chat:', error);
        // You might want to show a toast/notification here
        // For now, at least try to open with just the user info if API fails (though messages won't work well without convId)
        // Actually, openChat expects a conversationID as first arg usually? 
        // In the current openChat implementaiton: openChat(id: number, type: 'USER' | 'PET', recipientData: ChatUser | ChatPet)
        // The first argument 'id' is mapped to 'activeConversationId'.
        // So we MUST have a conversation ID.
    }
  }, [openChat]);

  return (
    <ChatContext.Provider value={{
      isOpen,
      activeConversationId,
      recipient,
      recipientType,
      openChat,
      startChatWithUser,
      closeChat,
      minimizeChat,
      isMinimized
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
