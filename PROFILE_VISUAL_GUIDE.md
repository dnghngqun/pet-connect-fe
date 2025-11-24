# 🎨 Profile Page - Visual Guide

---

## 📱 Desktop View (>= md breakpoint)

```
┌─────────────────────────────────────────────────────────────────┐
│  PETCONNECT                    🔍  [Đăng bài]    [Avatar▼]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PROFILE HEADER                            │
│  ┌─────────┐  Nguyễn Văn A                                       │
│  │         │  Yêu thích các thú cưng                             │
│  │ Avatar  │  📧 a@example.com      📱 0912345678                │
│  │ 128x128 │  📍 Quận 1, TP.HCM     📅 Thành viên 2 tháng       │
│  │✓ Verified                                                     │
│  │         │  [✏️ Chỉnh sửa] [📤 Chia sẻ] [💬 Liên hệ]         │
│  └─────────┘                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ [Thông tin cá nhân] [Bài đăng (2)] [Đã quan tâm (2)]          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ THÔNG TIN CÁ NHÂN CHI TIẾT                                  │ │
│ │                                                              │ │
│ │  HỌ VÀ TÊN          EMAIL                EMAIL              │ │
│ │  Nguyễn Văn A       a@example.com       0912345678         │ │
│ │                                                              │ │
│ │  ĐỊA CHỈ            QUẬN/HUYỆN         THÀNH PHỐ          │ │
│ │  123 Đường Lê Lợi   Quận 1            TP. Hồ Chí Minh    │ │
│ │                                                              │ │
│ │  NGÀY THAM GIA      XÁC THỰC                               │ │
│ │  21 tháng 11, 2025  ✓ Đã xác thực                         │ │
│ │                                                              │ │
│ │  TIỂU SỬ                                                    │ │
│ │  Yêu thích các thú cưng và muốn giúp đỡ những bạn lông lông│ │
│ │                                                              │ │
│ │  [📝 Cập nhật thông tin]                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ [Thông tin cá nhân] [Bài đăng (2)] [Đã quan tâm (2)]          │
│                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────┐   │
│ │                     │ │                     │ │          │   │
│ │    [POST IMAGE]     │ │    [POST IMAGE]     │ │  [POST]  │   │
│ │  [RED BADGE]   ❤️   │ │  [GREEN BADGE] ❤️  │ │ [IMAGE]  │   │
│ │                     │ │                     │ │  (Empty) │   │
│ │ Chó Husky mất       │ │ Mèo Ba Tư đang     │ │          │   │
│ │ tích tại quận 1     │ │ tìm gia đình       │ │          │   │
│ │                     │ │                     │ │          │   │
│ │ 📍 Quận 1, TP.HCM  │ │ 📍 Quận 3, TP.HCM  │ │          │   │
│ │ 🐾 Husky 👁️ 2450   │ │ 🐾 Mèo 👁️ 890     │ │          │   │
│ │                     │ │                     │ │          │   │
│ │ [Avatar] Nguyen... │ │ [Avatar] Nguyen... │ │          │   │
│ │ 21/11/2024          │ │ 20/11/2024          │ │          │   │
│ │                     │ │                     │ │          │   │
│ │ [❤️ Quan tâm] [Chat]│ │ [❤️ Quan tâm] [Chat]│ │          │   │
│ └─────────────────────┘ └─────────────────────┘ └──────────┘   │
│                                                                 │
│ Chưa có bài đăng nào khác                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile View (< md breakpoint)

```
┌────────────────────────────┐
│ 🍔  PETCONNECT      🔍 👤  │
└────────────────────────────┘

┌────────────────────────────┐
│   PROFILE HEADER           │
│                            │
│      ┌─────────┐           │
│      │ Avatar  │           │
│      │ 128x128 │           │
│      │✓Verified│           │
│      └─────────┘           │
│                            │
│  Nguyễn Văn A              │
│  Yêu thích thú cưng        │
│                            │
│  📧 a@example.com          │
│  📱 0912345678             │
│  📍 Quận 1, TP.HCM         │
│  📅 Thành viên 2 tháng     │
│                            │
│  [✏️ Chỉnh sửa]            │
│  [📤 Chia sẻ]             │
│  [💬 Liên hệ]             │
└────────────────────────────┘

┌────────────────────────────┐
│ Info │ Posts (2) │ Favorites│
│                            │
│ HỌ VÀ TÊN                  │
│ Nguyễn Văn A               │
│                            │
│ EMAIL                      │
│ a@example.com              │
│                            │
│ SỐ ĐIỆN THOẠI              │
│ 0912345678                 │
│                            │
│ ... (more fields)          │
│                            │
│ [Cập nhật thông tin]       │
└────────────────────────────┘
```

---

## 🎨 Color Scheme

### Status Badges
```
THẤT LẠC (LOST)
┌──────────────────┐
│ 🔴 Thất lạc     │
└──────────────────┘
bg-red-100, text-red-800

TÌM THẤY (FOUND)
┌──────────────────┐
│ 🔵 Tìm thấy     │
└──────────────────┘
bg-blue-100, text-blue-800

CẦN NHÀ (FOR_ADOPTION)
┌──────────────────┐
│ 🟢 Cần nhà       │
└──────────────────┘
bg-green-100, text-green-800

CỨU HỘ (RESCUE)
┌──────────────────┐
│ 🟠 Cứu hộ        │
└──────────────────┘
bg-orange-100, text-orange-800

VERIFIED
┌──────────────────┐
│ ✓ Đã xác thực    │
└──────────────────┘
bg-green-600 (solid)
```

### Heart Button States
```
NOT FAVORITED               FAVORITED
┌─────────┐              ┌─────────┐
│    ❤️   │              │    ❤️   │
│ outline │              │  filled │
│  gray   │              │   red   │
└─────────┘              └─────────┘
text-gray-600            fill-red-500
                        text-red-500
```

---

## 🔀 Tab Navigation

### Thông Tin Cá Nhân Tab
```
┌──────────────────────────────────────┐
│ INPUT: Profile data from localStorage│
│                                      │
│ DISPLAY:                             │
│ - Avatar (large, 128x128)           │
│ - Name, Bio                         │
│ - Contact info                      │
│ - Address                           │
│ - Join date                         │
│ - Verification status               │
│                                      │
│ ACTION: Update button                │
└──────────────────────────────────────┘
```

### Bài Đăng Của Tôi Tab
```
┌──────────────────────────────────────┐
│ INPUT: mockUserPosts (2 items)       │
│                                      │
│ DISPLAY: Grid of PostCards           │
│ - 3 columns (desktop)                │
│ - 2 columns (tablet)                 │
│ - 1 column (mobile)                  │
│                                      │
│ ACTIONS:                             │
│ - Toggle favorite                    │
│ - Contact author                     │
│                                      │
│ EMPTY STATE:                         │
│ - Message + "Đăng bài mới" button   │
└──────────────────────────────────────┘
```

### Đã Quan Tâm Tab
```
┌──────────────────────────────────────┐
│ INPUT: mockFavoritePosts (2 items)   │
│ All marked as favorited              │
│                                      │
│ DISPLAY: Grid of PostCards           │
│ - Hearts are red/filled              │
│ - Can toggle off                     │
│                                      │
│ EMPTY STATE:                         │
│ - Message + "Duyệt bài đăng" button │
└──────────────────────────────────────┘
```

---

## 🧩 Post Card Components

### Post Card Structure
```
┌─────────────────────────────────┐
│  [IMAGE] [BADGE] [VIEWS] ❤️     │  ← Image Section
├─────────────────────────────────┤
│ Post Title (2 lines max)        │  ← Title
│                                 │
│ Post Description (2 lines max)  │  ← Description
│                                 │
│ 📍 Location                     │  ← Location Info
│ 🐾 Pet Type                     │  ← Pet Type
│                                 │
│ ┌──────────────┐                │  ← Posted By
│ │ [Avatar] Name│                │
│ │ Posted Date  │                │
│ └──────────────┘                │
│                                 │
│ [❤️ Quan tâm] [💬 Liên hệ]      │  ← Actions
└─────────────────────────────────┘
```

### Favorite Button Position
```
IMAGE SECTION
┌─────────────────────────────┐
│                             │
│     [POST IMAGE]            │
│                             │
│  [BADGE]          [VIEWS]   │
│                       [❤️]   │ ← Bottom-right
│                             │
└─────────────────────────────┘
White bg, heart toggles red/gray
```

---

## 🎭 Interactive States

### Avatar Hover
```
Before:                After:
┌─────────┐            ┌─────────┐
│ Avatar  │ ─hover─>  │ Avatar  │
│ Normal  │            │ Selected│
└─────────┘            └─────────┘
```

### Heart Button Interactions
```
Default                Click              
❤️ outline  ─click─>  ❤️ filled  ─click─>  ❤️ outline
gray                   red                  gray

State: not favorited → favorited → not favorited
```

### Tab Interactions
```
[Active Tab]  [Inactive Tab]  [Inactive Tab]
   ━━━                                        
   Content shows         Content hidden        

Click → [Inactive Tab] becomes [Active Tab]
      ← Previous [Active Tab] becomes [Inactive Tab]
```

---

## 📐 Dimensions & Spacing

### Avatar
```
Width:  128px
Height: 128px
Border: 4px primary
Radius: 50% (circle)
```

### Post Card Grid
```
Desktop (lg):  3 columns
Tablet (md):   2 columns  
Mobile (sm):   1 column
Gap:           1rem (16px)
```

### Font Sizes
```
Profile Name:       3xl (30px)
Bio:                lg (18px)
Labels:             xs (12px) uppercase
Values:             lg (18px)
Post Title:         lg (18px)
Post Description:   sm (14px)
```

### Spacing
```
Header Section:  py-8
Tab Content:     pt-4
Cards:           p-4
Post Grid Gap:   gap-4
Info Grid Gap:   gap-6
```

---

## ✨ Visual Effects

### Shadows
```
Card Hover:        shadow-lg
Post Card Hover:   hover:shadow-lg
Button Hover:      hover:bg-opacity-90
```

### Transitions
```
All Buttons:       transition-all
Post Cards:        hover:translate-y-[-4px]
Heart Icon:        transition-colors
Image Hover:       scale-105
```

### Borders
```
Avatar Border:     4px primary
Card Border:       1px border-2 (header)
Dividers:          border-t (posted by)
Tab Active:        underline
```

---

## 🎯 Key Features Summary

| Feature | Visual | Location |
|---------|--------|----------|
| Avatar | Large circle, 128x128 | Profile header, left |
| Status Badge | Green with checkmark | Profile header, top |
| Heart Button | Outline/filled, red | Post image, bottom-right |
| Tab Navigation | 3 tabs with content | Below header |
| Grid Layout | Responsive 1-3 cols | Tab content |
| Color Coding | Status colors by type | Post badges |
| Icons | Lucide icons | Throughout |

---

## 🚀 User Experience Flow

### First Time Visiting Profile

```
1. User clicks profile link
   ↓
2. Load user data from localStorage
   ↓
3. Display large avatar with name
   ↓
4. Show default tab (User Info)
   ↓
5. Display all personal information
   ↓
6. Switch to My Posts tab
   ↓
7. See 2 sample posts in grid
   ↓
8. Click favorite button to test
   ↓
9. Switch to Favorites tab
   ↓
10. See favorite posts with red hearts
```

---

**Last Updated:** November 21, 2025  
**Version:** 2.0.0  
**Status:** ✅ Visual Design Complete

