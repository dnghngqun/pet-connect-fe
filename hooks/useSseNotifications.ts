'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { BASE_URL } from '@/common/Constant/COMMON_API';

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
  fromPetId?: number;
  fromPetName?: string;
  fromPetAvatar?: string;
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

const API_BASE = BASE_URL;

export function useSseNotifications(): UseSseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

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

    const handleIncoming = (event: MessageEvent) => {
      try {
        const notification: NotificationDTO = JSON.parse(event.data);
        setNotifications(prev => {
          if (prev.some(item => item.id === notification.id)) {
            return prev;
          }
          return [notification, ...prev].slice(0, 50);
        });
      } catch (err) {
        console.error('Failed to parse SSE notification:', err);
      }
    };

    eventSource.addEventListener('NOTIFICATION', handleIncoming);
    eventSource.onmessage = handleIncoming;

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
    loadNotifications();
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, loadNotifications]);

  const markAsRead = useCallback((id: number) => {
    notificationService.markAsRead(id).catch((error) => {
      console.error('Failed to mark notification as read:', error);
    });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead().catch((error) => {
      console.error('Failed to mark all notifications as read:', error);
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
