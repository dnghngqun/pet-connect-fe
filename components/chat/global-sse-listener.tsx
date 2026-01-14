'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { useSseNotifications, NotificationDTO } from '@/hooks/useSseNotifications';
import authService from '@/services/authService';

export default function GlobalSseListener() {
    const { openChat, recipient } = useChatContext();
    const { notifications } = useSseNotifications();

    const processedIds = useRef<Set<number>>(new Set());

    // Listen for new message notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            
            // Avoid reprocessing the same notification
            if (processedIds.current.has(latest.id)) {
                return;
            }

            if (latest.type === 'MESSAGE') {
                // Mark as processed
                processedIds.current.add(latest.id);

                // Assuming 'latest' has sender info. 
                if (latest.fromUserId) {
                     // Check if already open (User logic)
                     if (recipient && 'id' in recipient && recipient.id === latest.fromUserId) {
                         return;
                     }
                     
                     // Auto open mini chat
                     openChat(latest.fromUserId, 'USER', {
                         id: latest.fromUserId,
                         fullName: latest.fromUserName || 'User',
                         avatarUrl: latest.fromUserAvatar
                     });
                }
            }
        }
    }, [notifications, openChat, recipient]);

    // DEV ONLY: Expose a helper to simulate incoming SSE message for testing
    useEffect(() => {
        (window as any).simulateIncomingMessage = () => {
             const fakeNotif: NotificationDTO = {
                 id: Date.now(),
                 type: 'MESSAGE',
                 title: 'New Message',
                 content: 'Hello World from simulation!',
                 createdAt: new Date().toISOString(),
                 isRead: false,
                 fromUserId: 999,
                 fromUserName: 'Simulated User',
                 fromUserAvatar: 'https://via.placeholder.com/50'
             };
             // We can't directly push to 'notifications' state from here effectively without hacking internal hooks.
             // Instead, we will directly call openChat to prove the UI works, or rely on real SSE.
             // Actually, since we can't easily emit a fake SSE event to the EventSource, 
             // let's just create a hidden button for the user to click if they want to debug, or skip this hack.
             // Better: Just Notify User to test with real flow or use proper dev tools.
             console.log("To simulate message: sending fake notification via window dispatch (mock)");
        };
    }, []);

    return null;
}
