'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '@/services/authService';
import { chatAPI, normalizeMessageResponse } from '@/services/chatService';
import { MessageType } from '@/lib/chat.types';

interface UseSseChatReturn {
  messages: MessageType[];
  isConnected: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, messageType?: 'TEXT' | 'IMAGE' | 'FILE') => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function useSseChat(conversationId: number | null): UseSseChatReturn {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial history
  useEffect(() => {
    if (!conversationId) {
        setMessages([]);
        return;
    }

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // Fetch first page with 100 limit as requested
            const { messages: historyMessages, pagination } = await chatAPI.getSingleChat(String(conversationId), 1, 100);
            setMessages(historyMessages);
            setPage(1);
            setHasMore(pagination ? pagination.page < pagination.totalPages : (historyMessages.length === 100)); // Rough estimate if pagination null
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

  const connect = useCallback(() => {
    if (!conversationId) return;
    
    const user = authService.getCurrentUser();
    if (!user?.token) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create SSE connection with token as query param
    const url = `${API_BASE}/api/sse/conversations/${conversationId}?token=${encodeURIComponent(user.token)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`SSE Chat connected to conversation ${conversationId}`);
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const rawMessage = JSON.parse(event.data);
        const normalizedMsg = normalizeMessageResponse(rawMessage);
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === normalizedMsg._id)) {
            return prev;
          }
          return [...prev, normalizedMsg];
        });
      } catch (err) {
        console.error('Failed to parse SSE chat message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Chat error:', error);
      setIsConnected(false);
      eventSource.close();
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [conversationId]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
    if (!conversationId) return;
    
    try {
        await chatAPI.sendMessage({
            chatId: String(conversationId),
            content,
            image: messageType === 'IMAGE' ? content : undefined, // If IMAGE, content is URL usually? or specialized handling
        });
      // Message will come back via SSE
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId]);

  return {
    messages,
    isConnected,
    isLoadingHistory,
    hasMore,
    loadMore,
    sendMessage,
  };
}
