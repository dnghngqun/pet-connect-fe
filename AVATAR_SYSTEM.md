# 🎨 Avatar System Documentation - PetConnect

---

## 📌 Overview

PetConnect sử dụng hệ thống avatar động để hiển thị ảnh đại diện người dùng. Nếu người dùng không có ảnh, hệ thống sẽ tự động gán một avatar mặc định từ **DiceBear API**.

---

## 🔄 Quy Trình Hoạt Động

### 1. User Đăng Ký / Đăng Nhập

```
User Submit Register/Login Form
                ↓
    API trả về response với avatarUrl (null hoặc URL)
                ↓
    authService.tsx kiểm tra avatarUrl
                ↓
    Nếu avatarUrl === null:
      → Chọn random avatar từ DEFAULT_AVATARS list
      → Gán vào userData.avatarUrl
    Else:
      → Giữ nguyên avatarUrl từ API
                ↓
    Lưu userData vào localStorage('pet-connect-user')
                ↓
    Redirect đến trang chủ
```

---

## 🎯 Default Avatars List

### Current Implementation

File: `services/authService.tsx`

```typescript
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
];

const getRandomDefaultAvatar = (): string => {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};
```

### Avatar Styles Có Sẵn

DiceBear API hỗ trợ nhiều style khác nhau:

1. **avataaars** (hiện tại) - Cartoon style avatars
   - Diverse and fun
   - Highly customizable

2. **adventurer** - Adventure-style characters
   - More detailed

3. **bottts** - Robot/bot style
   - Technical look

4. **pixel-art** - Pixel art style
   - Retro look

5. **lorelei** - Abstract style
   - Minimalist

### Thay Đổi Style

Để thay đổi avatar style, cập nhật DEFAULT_AVATARS trong `services/authService.tsx`:

```typescript
// Thay đổi từ avataaars thành adventurer
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=user1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=user2',
  // ... etc
];

// Hoặc với tùy chỉnh
'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&scale=80&backgroundColor=random'
```

### Thêm Avatars Tùy Chỉnh

Bạn có thể thêm các URLs tùy chỉnh:

```typescript
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  // ... hoặc
  'https://your-domain.com/avatars/avatar1.png',
  'https://your-domain.com/avatars/avatar2.png',
  'https://cloudinary.com/your-avatars/avatar1.jpg',
];
```

---

## 💾 Avatar Storage

### localStorage Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
  "roleCode": "USER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Key Points

- Avatar URL được lưu **cùng với user data**
- **Không thay đổi** sau khi được set (tránh nhần lẫn)
- Nếu user update ảnh thực tế, backend sẽ cập nhật avatarUrl
- localStorage tự động clear khi logout

---

## 🎭 Avatar Display

### UserDropdown Component

File: `components/user-dropdown.tsx`

```typescript
<Avatar className="h-8 w-8">
  <AvatarImage 
    src={user.avatarUrl || undefined} 
    alt={user.fullName}
    onError={(e) => {
      // Nếu image fail to load, show fallback
      e.currentTarget.style.display = "none"
    }}
  />
  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
</Avatar>
```

### Display Logic

```
Hiển thị Avatar:
  ↓
Nếu avatarUrl load thành công:
  → Hiển thị image
  ↓
Nếu avatarUrl fail to load:
  → Ẩn image, hiển thị fallback
  → Fallback = Initials (2 chữ cái đầu)
```

### Initials Generator

```typescript
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Examples:
// "Nguyễn Văn A" → "NV"
// "John Doe" → "JD"
// "Alice" → "AL" (nếu chỉ có 1 từ, lấy A + l)
```

---

## 📱 Header Integration

### Header Display (Desktop)

```
Header Right Section:
├─ Search Button
├─ "Đăng bài" Button
└─ Auth Section:
   ├─ Nếu chưa login:
   │  ├─ "Đăng nhập" Button
   │  └─ "Đăng ký" Button
   └─ Nếu đã login:
      └─ UserDropdown (Avatar)
```

### Header Display (Mobile)

```
Header Right Section:
├─ Search Button
└─ Auth Section:
   ├─ Nếu chưa login:
   │  └─ User Icon Button → /sign-in
   └─ Nếu đã login:
      └─ UserDropdown (Avatar)
```

---

## 🔧 Implementation Details

### File: services/authService.tsx

```typescript
export const login = async (email: string, password: string) => {
  const response = await apiClient.post(COMMON_API.login, { email, password });

  if (response.data?.data?.token) {
    const userData = response.data.data;
    
    // If avatarUrl is null, assign a random default avatar
    if (!userData.avatarUrl) {
      userData.avatarUrl = getRandomDefaultAvatar();
    }
    
    // Save to localStorage với key 'pet-connect-user'
    localStorage.setItem('pet-connect-user', JSON.stringify(userData));
  }

  return response.data;
};

export const register = async (...) => {
  const response = await apiClient.post(COMMON_API.register, {...});
  
  if (response.data?.data?.token) {
    const userData = response.data.data;
    if (!userData.avatarUrl) {
      userData.avatarUrl = getRandomDefaultAvatar();
    }
    localStorage.setItem('pet-connect-user', JSON.stringify(userData));
  }
  
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('pet-connect-user');
  return user ? JSON.parse(user) : null;
};
```

### File: components/user-dropdown.tsx

```typescript
export default function UserDropdown() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage on mount
    const userData = authService.getCurrentUser()
    setUser(userData)
    setIsLoading(false)
  }, [])

  if (isLoading || !user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User info and menu items */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### File: components/header.tsx

```typescript
export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setIsLoggedIn(!!user)
    setIsLoading(false)
  }, [])

  return (
    <header>
      {/* ... */}
      <div className="hidden md:flex gap-2">
        {!isLoading && !isLoggedIn ? (
          <>
            <Link href="/sign-in"><Button>Đăng nhập</Button></Link>
            <Link href="/sign-up"><Button>Đăng ký</Button></Link>
          </>
        ) : !isLoading ? (
          <UserDropdown />
        ) : null}
      </div>
    </header>
  )
}
```

---

## 🌐 API Integration

### Login Response Example

```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": null,  // hoặc URL nếu có
    "roleCode": "USER",
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### Avatar Update Flow (Future)

```
User Upload Avatar
        ↓
API process image & return new avatarUrl
        ↓
Update userData.avatarUrl
        ↓
Update localStorage('pet-connect-user')
        ↓
Component re-render with new avatar
```

---

## 🚨 Error Handling

### Avatar Load Failure

```typescript
<AvatarImage 
  src={user.avatarUrl}
  onError={(e) => {
    e.currentTarget.style.display = "none"
  }}
/>
<AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
```

Nếu image không load:
1. `onError` được trigger
2. Image element bị ẩn
3. Fallback initials hiển thị
4. User vẫn thấy một cái gì đó (không bị blank)

---

## 📊 Avatar Selection Algorithm

### Current: Random Selection

```typescript
const getRandomDefaultAvatar = (): string => {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}

// Probability: 1/8 cho mỗi avatar
```

### Alternative: Deterministic (Hash-based)

Nếu muốn avatar consistent dựa trên user ID:

```typescript
const getDeterministicAvatar = (userId: number | string): string => {
  const hash = hashFunction(userId);
  return DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length];
}

// Mỗi user sẽ luôn nhận cùng một avatar
```

### Alternative: User Choice

Future: cho user chọn avatar từ list

```typescript
const selectAvatar = (userId: string, avatarIndex: number) => {
  const selectedAvatar = DEFAULT_AVATARS[avatarIndex];
  // Update user profile with selected avatar
}
```

---

## 🎯 Best Practices

1. **Load avatars từ CDN**
   - DiceBear API là CDN
   - Nhanh và lightweight

2. **Fallback content**
   - Luôn có initials fallback
   - Avoid blank avatar

3. **Cache avatarUrl**
   - Lưu URL trong localStorage
   - Không call API mỗi lần
   - Consistent avatar

4. **Error handling**
   - Catch image load errors
   - Fallback gracefully

5. **Performance**
   - Avatar size: h-8 w-8 (32x32px)
   - SVG format (từ DiceBear)
   - Lightweight

---

## 🔄 Maintenance

### Adding More Avatars

```typescript
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
  // Add more URLs here
];
```

### Changing Avatar Provider

From DiceBear to custom:

```typescript
const DEFAULT_AVATARS = [
  'https://your-cdn.com/avatars/avatar1.svg',
  'https://your-cdn.com/avatars/avatar2.svg',
  // ... etc
];
```

---

## 📝 Notes

- Avatar system là **stateless** (không depend vào backend change)
- Mỗi new user sẽ nhận random avatar
- Avatar không thay đổi sau khi set
- localStorage là single source of truth

---

**Cập nhật:** 21 November 2025  
**Phiên bản:** 1.0.0  
**Status:** ✅ Active

