# 🚀 Quick Reference - Login & Avatar System

---

## 📍 File Structure

```
/pet-store-1-0-0/
├── services/
│   └── authService.tsx          ← Auth logic, avatar assignment
├── components/
│   ├── header.tsx               ← Header with login check
│   ├── user-dropdown.tsx        ← Avatar dropdown menu
│   └── ui/avatar.tsx            ← Avatar UI component
├── app/
│   ├── sign-in/page.tsx         ← Login page
│   ├── sign-up/page.tsx         ← Register page
│   └── profile/page.tsx         ← User profile (in future)
└── docs/
    ├── IMPLEMENTATION_SUMMARY.md ← This file
    ├── AVATAR_SYSTEM.md         ← Avatar detailed docs
    ├── RESPONSES_DETAIL.md      ← API responses
    └── DATABASE_SCHEMA.md       ← DB tables
```

---

## 🔑 Key Functions

### authService.tsx

```typescript
// Login user
login(email, password) → { user data + token }

// Register user
register(fullName, phoneNumber, email, password) → { user data + token }

// Get current user from localStorage
getCurrentUser() → { user data } | null

// Logout user
logout() → clears localStorage
```

### header.tsx

```typescript
useEffect(() => {
  // Check login status on mount
  const user = authService.getCurrentUser()
  setIsLoggedIn(!!user)
})

// Conditionally render:
// - Login/Register buttons (not logged in)
// - Avatar dropdown (logged in)
```

### user-dropdown.tsx

```typescript
// Display user info
// - Avatar with fallback initials
// - User name & email
// - Links: Profile, Logout

handleLogout() → {
  authService.logout()
  router.push("/")
  window.location.reload()
}
```

---

## 🔄 Data Flow

### Registration Flow

```
1. User fills form & submits
   ↓
2. authService.register(fullName, phoneNumber, email, password)
   ↓
3. API returns response with avatarUrl (null or URL)
   ↓
4. If avatarUrl === null:
     → Assign random default avatar
   ↓
5. Save to localStorage('pet-connect-user')
   ↓
6. Redirect to home page
```

### Login Flow

```
1. User enters email & password
   ↓
2. authService.login(email, password)
   ↓
3. API returns response with avatarUrl
   ↓
4. If avatarUrl === null:
     → Assign random default avatar
   ↓
5. Save to localStorage('pet-connect-user')
   ↓
6. Header component detects login
   ↓
7. Avatar appears in header
```

### Header Render Flow

```
Header mounts
   ↓
useEffect triggers
   ↓
getCurrentUser() from localStorage
   ↓
If user found:
   → isLoggedIn = true
   → Show UserDropdown (avatar)
Else:
   → isLoggedIn = false
   → Show Login/Register buttons
```

---

## 💾 localStorage Schema

**Key:** `pet-connect-user`

```json
{
  "id": number,
  "email": string,
  "fullName": string,
  "avatarUrl": string (URL or DiceBear SVG),
  "roleCode": "USER" | "ADMIN" | "ORGANIZATION",
  "token": string (JWT)
}
```

---

## 🎨 Avatar System

### Default Avatars (8 options)

```
https://api.dicebear.com/7.x/avataaars/svg?seed=user1
https://api.dicebear.com/7.x/avataaars/svg?seed=user2
https://api.dicebear.com/7.x/avataaars/svg?seed=user3
https://api.dicebear.com/7.x/avataaars/svg?seed=user4
https://api.dicebear.com/7.x/avataaars/svg?seed=user5
https://api.dicebear.com/7.x/avataaars/svg?seed=user6
https://api.dicebear.com/7.x/avataaars/svg?seed=user7
https://api.dicebear.com/7.x/avataaars/svg?seed=user8
```

### Random Selection

```typescript
getRandomDefaultAvatar() 
  → Returns random URL from above list
  → Each user gets 1/8 probability
```

### Display Logic

```
Avatar Component:
  ├─ Try to load image from avatarUrl
  ├─ If success:
  │  └─ Display image
  └─ If fail:
     └─ Display initials (from user fullName)
```

### Initials Generator

```typescript
"Nguyễn Văn A" → "NV"
"John Doe" → "JD"
```

---

## 🌐 API Endpoints

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "email": "a@example.com",
  "password": "Password123!"
}

Response 201:
{
  "code": "0000",
  "message": "Đăng ký thành công",
  "data": {
    "id": 2,
    "email": "a@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": null,
    "roleCode": "USER",
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "a@example.com",
  "password": "Password123!"
}

Response 200:
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "id": 2,
    "email": "a@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    "roleCode": "USER",
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## 🧪 Testing Checklist

### Registration
- [ ] Fill form with valid data
- [ ] See validation errors for invalid input
- [ ] Submit form → API call
- [ ] User created → auto login
- [ ] Avatar appears in header
- [ ] localStorage has 'pet-connect-user'

### Login
- [ ] Fill email & password
- [ ] See validation errors
- [ ] Submit form → API call
- [ ] Avatar appears in header
- [ ] localStorage updated

### Avatar Display
- [ ] Avatar shows as small circle (32x32)
- [ ] Fallback initials if image fails
- [ ] Different avatar for each random user
- [ ] Avatar consistent after refresh (from localStorage)

### Dropdown Menu
- [ ] Click avatar → menu appears
- [ ] Shows user name & email
- [ ] "Trang cá nhân" links to /profile
- [ ] "Đăng xuất" clears data
- [ ] After logout, buttons reappear

### Responsive
- [ ] Desktop: Avatar or buttons (gap-2)
- [ ] Mobile: Avatar or user icon button
- [ ] Menu works on both sizes

---

## 🔧 Common Tasks

### Update Default Avatars

File: `services/authService.tsx`

```typescript
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=user1',
  // ... 8 URLs total
];
```

### Add Avatar Upload Feature

Future enhancement:

```typescript
// 1. Create upload endpoint
POST /api/users/avatar

// 2. Update authService to handle new avatar
updateUserAvatar(file) → new avatarUrl

// 3. Update localStorage
getCurrentUser().avatarUrl = newURL
```

### Change Avatar Style

In DEFAULT_AVATARS:

```
From: avataaars
To:   bottts (robots)
      adventurer (detailed)
      pixel-art (retro)
      lorelei (abstract)
```

Example:
```typescript
'https://api.dicebear.com/7.x/bottts/svg?seed=user1'
```

---

## 🚨 Troubleshooting

### Avatar not showing

**Problem:** Avatar image shows as blank

**Solutions:**
1. Check avatarUrl in localStorage
2. Check if URL is valid (paste in browser)
3. Check image load error in console
4. Fallback should show initials

### Login not persisting

**Problem:** User logs in but logs out on refresh

**Solutions:**
1. Check localStorage has 'pet-connect-user'
2. Check token is valid
3. Check JSON parse/stringify

### Avatar dropdown not opening

**Problem:** Click avatar but menu doesn't appear

**Solutions:**
1. Check isLoading state is false
2. Check user data exists
3. Check DropdownMenu component props

---

## 📚 Related Docs

- **IMPLEMENTATION_SUMMARY.md** - Full feature overview
- **AVATAR_SYSTEM.md** - Detailed avatar documentation
- **RESPONSES_DETAIL.md** - API response formats
- **DATABASE_SCHEMA.md** - Database tables

---

**Updated:** 21 November 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

