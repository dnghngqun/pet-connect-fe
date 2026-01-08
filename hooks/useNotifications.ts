import { useCallback, useEffect, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { Notification } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { chatAPI } from '@/services/chatService'

export function useNotifications() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user?._id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const notifs = await notificationService.getNotifications()
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.isRead).length)
    } catch (error) {
      console.error('Failed to load notifications', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [user?._id])

  const markAsRead = useCallback(async (notificationId: number) => {
    await notificationService.markAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0))
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user?._id) return
    await notificationService.markAllAsRead()
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    setUnreadCount(0)
  }, [user?._id])

  const deleteNotification = useCallback(async (notificationId: number) => {
    await notificationService.deleteNotification(notificationId)
    setNotifications((prev) => {
      const removed = prev.find((notif) => notif.id === notificationId)
      if (removed && !removed.isRead) {
        setUnreadCount((count) => (count > 0 ? count - 1 : 0))
      }
      return prev.filter((notif) => notif.id !== notificationId)
    })
  }, [])

  const clearAll = useCallback(async () => {
    if (!user?._id) return
    await notificationService.clearAllNotifications()
    setNotifications([])
    setUnreadCount(0)
  }, [user?._id])

  const handleSocketNotification = useCallback((payload: any) => {
    const incoming = payload?.data ?? payload
    if (!incoming?.id) return

    setNotifications((prev) => [
      incoming,
      ...prev.filter((notif) => notif.id !== incoming.id),
    ])
    if (!incoming.isRead) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  useEffect(() => {
    if (isAuthLoading) return
    refresh()
  }, [isAuthLoading, refresh])

  useEffect(() => {
    if (!user?.token) return

    chatAPI.connectWebSocket(user.token, undefined, undefined)
    const cleanup = chatAPI.addNotificationListener(handleSocketNotification)

    return () => {
      if (cleanup) cleanup()
    }
  }, [user?.token, handleSocketNotification])

  return {
    notifications,
    unreadCount,
    isLoading,
    isAuthenticated: Boolean(user?._id),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  }
}
