# Chat Feature Documentation

## Giới thiệu

Chat feature được tạo dựa trên cấu trúc từ Messenger project. Nó cung cấp khả năng:
- Tạo cuộc trò chuyện giữa các người dùng
- Gửi tin nhắn (text + ảnh)
- Trả lời tin nhắn cụ thể
- Danh sách cuộc trò chuyện real-time
- Polling để lấy tin nhắn mới (3 giây)
- Optimistic UI updates

## Cấu trúc thư mục

```
components/chat/
├── chat-body.tsx           # Hiển thị danh sách tin nhắn
├── chat-container.tsx      # Container chính
├── chat-footer.tsx         # Input tin nhắn
├── chat-header.tsx         # Header cuộc trò chuyện
├── chat-list.tsx           # Danh sách cuộc trò chuyện
├── chat-message-item.tsx   # Item tin nhắn
└── new-chat-dialog.tsx     # Dialog tạo cuộc trò chuyện mới

hooks/
├── useAuth.ts              # Hook auth
└── useChat.tsx             # Chat context & hook

services/
└── chatService.ts          # API calls

lib/
├── chat.types.ts           # TypeScript types
└── chat-helpers.ts         # Helper functions

app/
└── chat/
    ├── page.tsx            # Chat page
    └── layout.tsx          # Chat layout
```

## Sử dụng

### 1. Wrap ChatProvider trong page

```tsx
import { ChatProvider } from "@/hooks/useChat";
import { ChatContainer } from "@/components/chat/chat-container";

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContainer />
    </ChatProvider>
  );
}
```

### 2. Sử dụng useChat hook

```tsx
import { useChat } from "@/hooks/useChat";

export function MyComponent() {
  const {
    chats,
    messages,
    currentChat,
    isChatsLoading,
    fetchAllChats,
    selectChat,
    sendMessage,
    createChat,
  } = useChat();

  // Sử dụng các state và functions
}
```

### 3. API Methods

#### Fetch all chats
```tsx
await fetchAllChats();
```

#### Fetch all users
```tsx
await fetchAllUsers();
```

#### Select a chat
```tsx
await selectChat(chatId);
```

#### Create a new chat
```tsx
const newChat = await createChat({
  participantId: userId,
});
```

#### Send a message
```tsx
const message = await sendMessage({
  chatId: chatId,
  content: "Hello",
  image: imageDataUrl, // optional
  replyToId: messageId, // optional
});
```

#### Refresh messages
```tsx
await refreshMessages();
```

## Polling Strategy

- **Chats**: Polling mỗi 5 giây
- **Messages**: Polling mỗi 3 giây

Bạn có thể tùy chỉnh interval trong `useChat.tsx`:

```tsx
const interval = setInterval(fetchAllChats, 5000); // Thay đổi 5000 thành số ms bạn muốn
```

## Features

### ✅ Implemented
- [x] Danh sách cuộc trò chuyện
- [x] Gửi tin nhắn text
- [x] Gửi tin nhắn kèm ảnh
- [x] Trả lời tin nhắn
- [x] Tạo cuộc trò chuyện mới
- [x] Optimistic UI updates
- [x] Polling real-time
- [x] Responsive design
- [x] Không dùng zustand
- [x] Không dùng socket.io-client

### 🚀 Có thể thêm
- [ ] Nhóm chat
- [ ] Xóa tin nhắn
- [ ] Edit tin nhắn
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Message search
- [ ] User status (online/offline)
- [ ] WebSocket support (optional)

## API Endpoints

Giả sử backend running ở `http://localhost:5000/api`

```
GET    /chat/all                  # Lấy tất cả cuộc trò chuyện
GET    /chat/:id                  # Lấy chi tiết cuộc trò chuyện + tin nhắn
POST   /chat/create               # Tạo cuộc trò chuyện mới
POST   /chat/message/send         # Gửi tin nhắn
GET    /user/all                  # Lấy tất cả người dùng
```

## Customization

### Thay đổi polling interval

Trong `hooks/useChat.tsx`:

```tsx
// Chats polling
const interval = setInterval(fetchAllChats, 5000); // 5s

// Messages polling
const interval = setInterval(refreshMessages, 3000); // 3s
```

### Thay đổi styling

Tất cả components sử dụng Tailwind CSS. Bạn có thể tùy chỉnh className trong từng component.

### Thêm error handling

```tsx
const sendMessage = useCallback(
  async (payload: CreateMessagePayload) => {
    try {
      // ...
    } catch (error) {
      // Thêm error toast notification
      console.error("Failed to send message:", error);
    }
  },
  [user?._id, selectedChatId]
);
```

## Troubleshooting

### Messages không update
- Kiểm tra polling interval trong `useChat.tsx`
- Kiểm tra console cho errors
- Đảm bảo API endpoints là đúng

### Images không hiển thị
- Kiểm tra Cloudinary configuration
- Đảm bảo image URL valid
- Kiểm tra CORS settings

### Chat không tạo được
- Kiểm tra user authenticated
- Kiểm tra participant ID valid
- Kiểm tra API response

## Notes

- Component sử dụng React Context API (không zustand)
- Polling strategy (không socket.io-client)
- Optimistic UI updates cho UX tốt hơn
- Types đầy đủ với TypeScript
- Responsive design với Tailwind CSS
