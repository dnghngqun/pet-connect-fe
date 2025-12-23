'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  userId?: string
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications(userId)

  if (!userId) return null

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
        {/* Header */}
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

        {/* Notifications List */}
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
                  'px-4 py-3 border-b text-sm hover:bg-muted/50 transition-colors',
                  !notif.read && 'bg-blue-50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Link
                      href={notif.actionUrl || '#'}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id)
                        setOpen(false)
                      }}
                    >
                      <h3 className="font-semibold text-sm hover:text-primary">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notif.id)}
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

        {/* Footer */}
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

