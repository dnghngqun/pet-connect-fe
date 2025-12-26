import type { Notification } from '@/lib/types'

/**
 * Service quản lý notifications cho người dùng
 */
class NotificationService {
  private storageKey = 'pet-connect-notifications'

  /**
   * Lấy tất cả notifications của người dùng
   */
  getNotifications(userId: string): Notification[] {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return []

    const allNotifications = JSON.parse(stored) as Notification[]
    return allNotifications.filter((n) => n.userId === userId)
  }

  /**
   * Lấy notifications chưa đọc
   */
  getUnreadNotifications(userId: string): Notification[] {
    return this.getNotifications(userId).filter((n) => !n.read)
  }

  /**
   * Tạo notification mới
   */
  createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedPostId?: string,
    actionUrl?: string
  ): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      relatedPostId,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    }

    const stored = localStorage.getItem(this.storageKey)
    const allNotifications = stored ? JSON.parse(stored) : []
    allNotifications.push(notification)
    localStorage.setItem(this.storageKey, JSON.stringify(allNotifications))

    // Gửi browser notification nếu được phép
    this.sendBrowserNotification(title, message)

    return notification
  }

  /**
   * Đánh dấu notification là đã đọc
   */
  markAsRead(notificationId: string): void {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return

    const allNotifications = JSON.parse(stored) as Notification[]
    const notification = allNotifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      localStorage.setItem(this.storageKey, JSON.stringify(allNotifications))
    }
  }

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  markAllAsRead(userId: string): void {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return

    const allNotifications = JSON.parse(stored) as Notification[]
    allNotifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.read = true
      })
    localStorage.setItem(this.storageKey, JSON.stringify(allNotifications))
  }

  /**
   * Xóa notification
   */
  deleteNotification(notificationId: string): void {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return

    const allNotifications = JSON.parse(stored) as Notification[]
    const filtered = allNotifications.filter((n) => n.id !== notificationId)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  /**
   * Xóa tất cả notifications của người dùng
   */
  clearAllNotifications(userId: string): void {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return

    const allNotifications = JSON.parse(stored) as Notification[]
    const filtered = allNotifications.filter((n) => n.userId !== userId)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  /**
   * Gửi browser notification (nếu user cho phép)
   */
  private sendBrowserNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.svg',
      })
    }
  }

  /**
   * Yêu cầu quyền gửi notifications
   */
  requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.reject(new Error('Trình duyệt không hỗ trợ Notifications'))
    }
    return Notification.requestPermission()
  }
}

export const notificationService = new NotificationService()

/**
 * Gửi notification khi tìm thấy pet gần người dùng
 */
export function notifyNearbyPetFound(
  userId: string,
  petName: string,
  petType: string,
  postId: string
): Notification {
  return notificationService.createNotification(
    userId,
    'nearby-pets',
    `${petType} gần bạn!`,
    `Có một con ${petType.toLowerCase()} tên "${petName}" đã được đăng gần vị trí của bạn.`,
    postId,
    `/pet/${postId}`
  )
}

/**
 * Gửi notification khi có thú cưng thất lạc gần người dùng
 */
export function notifyNearbyPetLost(
  userId: string,
  petName: string,
  petType: string,
  location: string,
  postId: string
): Notification {
  return notificationService.createNotification(
    userId,
    'pet-lost',
    `${petType} thất lạc gần bạn!`,
    `Một con ${petType.toLowerCase()} tên "${petName}" đã thất lạc ở ${location}.`,
    postId,
    `/pet/${postId}`
  )
}

/**
 * Gửi notification khi có cơ hộp cứu hộ gần người dùng
 */
export function notifyNearbyRescueCenter(
  userId: string,
  centerName: string,
  distance: number
): Notification {
  return notificationService.createNotification(
    userId,
    'rescue-update',
    `Trung tâm cứu hộ gần bạn`,
    `${centerName} cách bạn ${distance.toFixed(1)} km.`,
    undefined,
    `/rescue-centers`
  )
}

