import { useEffect, useState, useCallback } from 'react'
import { notificationService } from '@/services/notificationService'
import { Notification } from '@/lib/types'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Lấy notifications
  const getNotifications = useCallback(() => {
    if (!userId) return
    const notifs = notificationService.getNotifications(userId)
    setNotifications(notifs)
    const unread = notifs.filter((n) => !n.read).length
    setUnreadCount(unread)
  }, [userId])

  // Đánh dấu là đã đọc
  const markAsRead = useCallback(
    (notificationId: string) => {
      notificationService.markAsRead(notificationId)
      getNotifications()
    },
    [getNotifications]
  )

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = useCallback(() => {
    if (!userId) return
    notificationService.markAllAsRead(userId)
    getNotifications()
  }, [userId, getNotifications])

  // Xóa notification
  const deleteNotification = useCallback(
    (notificationId: string) => {
      notificationService.deleteNotification(notificationId)
      getNotifications()
    },
    [getNotifications]
  )

  // Xóa tất cả
  const clearAll = useCallback(() => {
    if (!userId) return
    notificationService.clearAllNotifications(userId)
    getNotifications()
  }, [userId, getNotifications])

  // Load notifications on mount
  useEffect(() => {
    getNotifications()
  }, [getNotifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: getNotifications,
  }
}

