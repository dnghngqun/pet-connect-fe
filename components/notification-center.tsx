import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Trash2, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Notification } from '@/lib/types'
import { usePostModal } from '@/components/post-modal-provider'
const getNotificationLink = (notif: Notification): string | null => {
  if (notif.link) return notif.link;
  


  
  switch (notif.type) {
    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPTED':
      return notif.fromUserId ? `/profile/${notif.fromUserId}` : '/friends';
    case 'GROUP_INVITE':
    case 'GROUP_JOIN_REQUEST':
      return '/groups';
    case 'MESSAGE':
      return '/messages';
    default:
      return null;
  }
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { openPostModal } = usePostModal()
  const {
    notifications,
    unreadCount,
    isAuthenticated,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  if (!isAuthenticated) return null

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      markAsRead(notif.id)
    }
    setOpen(false)

    if (notif.postId) {
      await openPostModal(notif.postId.toString())
      return
    }

    const link = getNotificationLink(notif)
    if (link) {
      router.push(link)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">Thông báo</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'px-4 py-3 border-b text-sm hover:bg-muted/50 transition-colors cursor-pointer',
                  !notif.isRead && 'bg-blue-50'
                )}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={notif.fromUserAvatar} />
                        <AvatarFallback>
                          {notif.fromUserName?.charAt(0) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm hover:text-primary">
                          {notif.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notif.content}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full text-xs justify-center"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
