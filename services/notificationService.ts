import apiClient from '@/common/apiClient'
import { COMMON_API } from '@/common/Constant/COMMON_API'
import type { Notification } from '@/lib/types'

type ApiResponse<T> = {
  data?: T
  code?: string
  message?: string
  success?: boolean
}

const unwrapResponse = <T>(response: { data?: ApiResponse<T> } | undefined): T | null => {
  if (!response?.data) return null
  if (Object.prototype.hasOwnProperty.call(response.data, 'data')) {
    return response.data.data ?? null
  }
  return response.data as T
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get(COMMON_API.notifications)
    const payload = unwrapResponse<Notification[]>(response)
    return Array.isArray(payload) ? payload : []
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get(COMMON_API.notificationsUnread)
    const payload = unwrapResponse<Notification[]>(response)
    return Array.isArray(payload) ? payload : []
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get(COMMON_API.notificationsUnreadCount)
    const payload = unwrapResponse<number>(response)
    return typeof payload === 'number' ? payload : 0
  }

  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.put(COMMON_API.notificationRead(notificationId))
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put(COMMON_API.notificationsReadAll)
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(COMMON_API.notificationDelete(notificationId))
  }

  async clearAllNotifications(): Promise<void> {
    await apiClient.delete(COMMON_API.notificationsClear)
  }

  requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.reject(new Error('Trình duyệt không hỗ trợ Notifications'))
    }
    return Notification.requestPermission()
  }

  sendBrowserNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.svg',
      })
    }
  }
}

export const notificationService = new NotificationService()
