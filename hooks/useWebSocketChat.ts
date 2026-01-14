'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI, normalizeMessageResponse } from '@/services/chatService';
import authService from '@/services/authService';
import { MessageType } from '@/lib/chat.types';

interface UseWebSocketChatReturn {
  messages: MessageType[];
  isConnected: boolean; // Just a proxy for global state if needed, or we assume connected via context
  isLoadingHistory: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, messageType?: 'TEXT' | 'IMAGE' | 'FILE') => Promise<void>;
}

export function useWebSocketChat(conversationId: number | null): UseWebSocketChatReturn {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false); // Local tracking if needed, or rely on global

  useEffect(() => {
    if (!conversationId) return;
    const user = authService.getCurrentUser();
    if (!user?.token) return;
    chatAPI.connectWebSocket(user.token);
  }, [conversationId]);

  // Listen for WEBSOCKET messages
  useEffect(() => {
     if (!conversationId) return;

     // Subscribe to global chatAPI listener
     // Note: chatService broadcast to all listeners. We need to filter by conversationId.
     const removeListener = chatAPI.addMessageListener((newMsg: MessageType) => {
         // Check if message belongs to this conversation
         // Note: normalizeMessageResponse handles both 'chatId' and 'conversationId' props to 'chatId'
         // But the raw socket message might have 'conversationId'. 
         // Let's assume the listener receives the RAW or NORMALIZED message?
         // chatService.ts:174 -> listeners receive RESPONSE (JSON.parse(body)).
         
         const normalized = normalizeMessageResponse(newMsg);
         if (Number(normalized.chatId) === Number(conversationId)) {
             setMessages(prev => {
                 // Avoid duplicates
                 if (prev.some(m => m._id === normalized._id)) {
                     return prev;
                 }
                 return [...prev, normalized];
             });
             // Also mark connected if we receive something? No, that's not reliable.
         }
     });

     return () => {
         removeListener();
     };
  }, [conversationId]);


  // Fetch initial history (HTTP)
  useEffect(() => {
    if (!conversationId) {
        setMessages([]);
        return;
    }

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // Fetch first page with 100 limit
            const { messages: historyMessages, pagination } = await chatAPI.getSingleChat(String(conversationId), 1, 100);
            setMessages(historyMessages);
            setPage(1);
            setHasMore(pagination ? pagination.page < pagination.totalPages : (historyMessages.length === 100)); 
            setIsConnected(true); // Assume connected if HTTP works? Or check socket? 
            // Better to exposing connection state from ChatContext but valid enough for now.
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };
    
    fetchHistory();
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || isLoadingHistory || !hasMore) return;
    
    setIsLoadingHistory(true);
    const nextPage = page + 1;
    try {
        const { messages: prevMessages, pagination } = await chatAPI.getSingleChat(String(conversationId), nextPage, 100);
        
        if (prevMessages.length === 0) {
            setHasMore(false);
        } else {
            setMessages(current => {
                // Merge and deduplicate
                const existingIds = new Set(current.map(m => m._id));
                const newUnique = prevMessages.filter(m => !existingIds.has(m._id));
                return [...newUnique, ...current];
            });
            setPage(nextPage);
            if (pagination) {
                setHasMore(pagination.page < pagination.totalPages);
            }
        }
    } catch (error) {
        console.error('Failed to load more messages:', error);
    } finally {
        setIsLoadingHistory(false);
    }
  }, [conversationId, page, hasMore, isLoadingHistory]);


  const sendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
    if (!conversationId) return;
    
    try {
        // chatAPI.sendMessage handles WS if connected, else HTTP fallback
        const result = await chatAPI.sendMessage({
            chatId: String(conversationId),
            content,
            image: messageType === 'IMAGE' ? content : undefined,
        });

        // If returned result is NOT null, it means HTTP fallback was used or immediate return.
        // If it returns null, it was sent via WS and we wait for echo.
        // However, for better UX, optimistic update could be good. 
        // But for now let's rely on the echo (addMessageListener) to be consistent.
        
        // Wait, if fallback HTTP is used, it returns the message. useWebSocketChat listener MIGHT NOT fire for HTTP response?
        // chatService.ts currently returns object if HTTP, null if WS.
        // If HTTP, we should manually append it? 
        // Yes.
        if (result) {
            setMessages(prev => [...prev, result]);
        }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId]);

  return {
    messages,
    isConnected, // This is loosely tracked here, ideally derived from context
    isLoadingHistory,
    hasMore,
    loadMore,
    sendMessage,
  };
}
