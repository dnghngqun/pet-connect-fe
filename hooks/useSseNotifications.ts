'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '@/services/authService';

export interface NotificationDTO {
  id: number;
  type: string;
  title: string;
  content: string;
  link?: string;
  postId?: number;
  fromUserId?: number;
  fromUserName?: string;
  fromUserAvatar?: string;
  isRead: boolean;
  createdAt: string;
}

interface UseSseNotificationsReturn {
  notifications: NotificationDTO[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function useSseNotifications(): UseSseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const user = authService.getCurrentUser();
    if (!user?.token) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create SSE connection with token as query param (EventSource doesn't support headers)
    const url = `${API_BASE}/api/sse/notifications?token=${encodeURIComponent(user.token)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE Notifications connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: NotificationDTO = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      } catch (err) {
        console.error('Failed to parse SSE notification:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Notifications error:', error);
      setIsConnected(false);
      eventSource.close();
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, []);

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

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    // TODO: Call backend API to mark as read
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // TODO: Call backend API to mark all as read
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
