# Chat Feature - Quick Start Guide

## 1. Add Chat Link to Navigation

Update `components/header.tsx`:

```tsx
import Link from 'next/link';

export default function Header() {
  return (
    <nav>
      {/* ... existing nav items ... */}
      <Link href="/chat" className="nav-link">
        💬 Tin nhắn
      </Link>
    </nav>
  );
}
```

## 2. Add Chat Icon to User Dropdown

Update `components/user-dropdown.tsx`:

```tsx
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function UserDropdown() {
  return (
    <div className="dropdown-menu">
      {/* ... existing items ... */}
      <Link href="/chat" className="dropdown-item">
        <MessageCircle className="w-4 h-4" />
        <span>Tin nhắn</span>
      </Link>
    </div>
  );
}
```

## 3. Environment Setup

Make sure your `.env.local` has:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Then ensure `common/apiClient.tsx` uses this:

```tsx
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/api',
  withCredentials: true,
});

export default apiClient;
```

## 4. Test the Chat Feature

1. Navigate to `http://localhost:3000/chat`
2. Click "Tin nhắn mới"
3. Select a user
4. Start chatting!

## 5. Customize (Optional)

### Change polling interval

In `hooks/useChat.tsx`:

```tsx
// Update these intervals (in milliseconds)
const interval = setInterval(fetchAllChats, 5000);  // 5 seconds
const interval = setInterval(refreshMessages, 3000); // 3 seconds
```

### Change sidebar width

In `components/chat/chat-container.tsx`:

```tsx
<div className="w-80 border-r bg-white flex flex-col">
  {/* Change w-80 to w-64 or w-96 as needed */}
</div>
```

### Change colors/styling

All components use Tailwind CSS classes. Example colors:
- Primary blue: `bg-blue-500`, `text-blue-500`
- Message bubble: `bg-blue-100` for current user, `bg-gray-100` for others
- Hover states: `hover:bg-gray-100`

## 6. Known Limitations

1. **Polling-based**: Not real-time like WebSockets, but works well for most use cases
2. **No Zustand**: Uses React Context API instead
3. **No socket.io**: Uses REST API + polling
4. **Server-dependent**: Requires backend API to be running

## 7. Performance Tips

1. **Optimize polling intervals** based on your needs:
   - More frequent = more data usage but faster updates
   - Less frequent = less data usage but slower updates

2. **Optimize message loading**:
   - Load only recent messages initially
   - Implement pagination for older messages

3. **Image optimization**:
   - Compress images before sending
   - Use Next.js Image component for optimization

## 8. Future Improvements

1. **Add pagination** for messages
2. **Add message search**
3. **Add typing indicators**
4. **Add message reactions**
5. **Add group chat support**
6. **Migrate to WebSocket** for real-time (optional)
7. **Add message encryption** for security

## 9. API Response Structure

### GET /chat/all
```json
{
  "chats": [
    {
      "_id": "chat_id",
      "participants": [{ "_id": "user_id", "name": "User Name", "email": "user@email.com" }],
      "lastMessage": { "_id": "msg_id", "content": "Hello", "sender": {...}, ... },
      "isGroup": false,
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /chat/:id
```json
{
  "chat": { /* same as above */ },
  "messages": [
    {
      "_id": "msg_id",
      "content": "Hello",
      "image": null,
      "sender": { "_id": "user_id", "name": "User Name" },
      "chatId": "chat_id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /chat/create
**Request:**
```json
{
  "participantId": "user_id"
}
```

**Response:**
```json
{
  "chat": { /* chat object */ }
}
```

### POST /chat/message/send
**Request:**
```json
{
  "chatId": "chat_id",
  "content": "Message text",
  "image": "base64_image_data",
  "replyToId": "message_id" // optional
}
```

**Response:**
```json
{
  "userMessage": { /* message object */ }
}
```

## 10. Debugging

Enable debug logs in `services/chatService.ts`:

```tsx
console.log('API Call:', endpoint, payload);
```

Enable console logs in `hooks/useChat.tsx`:

```tsx
console.log('Chat state updated:', { chats, messages });
```

Check browser DevTools Network tab for API calls.

---

**Happy chatting! 🎉**
