# 🎨 Report System - Visual Guide

---

## 📱 Desktop View

### Post Card with 3-Dot Menu
```
┌─────────────────────────────────────────┐
│  PETCONNECT                🔍  📝  [👤▼]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│ [POST IMAGE]                            │
│                                         │
│ [RED]        [VIEWS:2450]  [3-DOT] [❤️]│
│ BADGE        10 lượt xem   (new!)      │
│                                         │
├─────────────────────────────────────────┤
│ Chó Husky mất tích tại quận 1          │
│                                         │
│ Con chó Husky bốc lông trắng xám, mắc │
│ vòng cổ xanh. Mất tích vào ngày 3/11.. │
│                                         │
│ 📍 Quận 1, TP.HCM   |  🐾 Husky       │
│                                         │
│ ─────────────────────────────────────── │
│ [Avatar] Nguyễn Văn A                  │
│ Đăng: 21/11/2024                       │
│                                         │
│ [Gọi]              [Chat]              │
└─────────────────────────────────────────┘

3-Dot Dropdown Menu:
┌──────────────────┐
│ 🚩 Báo cáo      │ ← Click here
└──────────────────┘
```

---

## 📋 Report Dialog - Full View

### Tab 1: Báo cáo bài đăng (Default)
```
┌──────────────────────────────────────────┐
│ ✕ Báo cáo                               │
│ Giúp chúng tôi cải thiện cộng đồng bằng│
│ cách báo cáo nội dung không phù hợp     │
├──────────────────────────────────────────┤
│ [Báo cáo bài đăng] [Báo cáo người dùng]│ ← Tabs
│  ↑ Active (underline)                    │
├──────────────────────────────────────────┤
│                                          │
│ Bài đăng:                                │
│ ┌──────────────────────────────────────┐ │
│ │ "Chó Husky mất tích tại quận 1"     │ │ ← Info box
│ └──────────────────────────────────────┘ │
│                                          │
│ Lý do báo cáo:                           │
│                                          │
│ ○ Spam hoặc quảng cáo                  │
│ ○ Nội dung không phù hợp                │
│ ○ Quấy rối hoặc bắt nạt                │
│ ○ Lừa đảo hoặc gian dối                │
│ ○ Hành hạ động vật                      │
│ ○ Thông tin sai lệch                    │
│ ○ Lý do khác                            │
│                                          │
│ [Gửi báo cáo]                           │
└──────────────────────────────────────────┘
```

---

## 🎯 Tab 2: Báo cáo người dùng

```
┌──────────────────────────────────────────┐
│ ✕ Báo cáo                               │
│ Giúp chúng tôi cải thiện cộng đồng bằng│
│ cách báo cáo nội dung không phù hợp     │
├──────────────────────────────────────────┤
│ [Báo cáo bài đăng] [Báo cáo người dùng]│
│                    ↑ Active (underline)  │
├──────────────────────────────────────────┤
│                                          │
│ Người dùng:                              │
│ ┌──────────────────────────────────────┐ │
│ │ Nguyễn Văn A                         │ │ ← User info
│ └──────────────────────────────────────┘ │
│                                          │
│ Lý do báo cáo:                           │
│                                          │
│ ○ Spam hoặc quảng cáo                  │
│ ○ Hành vi không phù hợp                 │
│ ○ Quấy rối hoặc bắt nạt                │
│ ○ Lừa đảo hoặc gian dối                │
│ ○ Hành vi nguy hiểm                    │
│ ○ Giả mạo                               │
│ ○ Lý do khác                            │
│                                          │
│ [Gửi báo cáo]                           │
└──────────────────────────────────────────┘
```

---

## ✏️ Custom Reason Input

### When "Lý do khác" Selected
```
┌──────────────────────────────────────────┐
│ Lý do báo cáo:                           │
│                                          │
│ ○ Spam hoặc quảng cáo                  │
│ ○ Nội dung không phù hợp                │
│ ○ Quấy rối hoặc bắt nạt                │
│ ○ Lừa đảo hoặc gian dối                │
│ ○ Hành hạ động vật                      │
│ ○ Thông tin sai lệch                    │
│ ◉ Lý do khác                ← Selected  │
│                                          │
│ Vui lòng mô tả lý do khác:              │
│ ┌──────────────────────────────────────┐ │
│ │ Nhập lý do khác của bạn...           │ │
│ │                                      │ │
│ │ [User typing here...]                │ │
│ │                                      │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Gửi báo cáo]                           │
└──────────────────────────────────────────┘
```

---

## 📱 Mobile View

### Post Card (Stacked)
```
┌──────────────────┐
│                  │
│ [POST IMAGE]     │
│                  │
│ [3] [Views] [❤️] │
│                  │
│ Title            │
│                  │
│ Description      │
│                  │
│ 📍 Location      │
│ 🐾 Pet Type      │
│                  │
│ [Avatar] User    │
│ Posted Date      │
│                  │
│ [Gọi] [Chat]    │
└──────────────────┘
```

### Mobile Report Dialog
```
(Full width, scrollable)

┌────────────────────┐
│ ✕ Báo cáo         │
│ Giúp chúng tôi... │
├────────────────────┤
│ [Post] [User]     │
├────────────────────┤
│ Post title...      │
│                    │
│ Reasons:           │
│ ○ Spam            │
│ ○ Content         │
│ ○ Harassment      │
│ ○ Scam            │
│ ○ Animal abuse    │
│ ○ Misleading      │
│ ○ Other           │
│                    │
│ [Gửi báo cáo]     │
└────────────────────┘
```

---

## 🎨 Color & Styling

### Elements Colors
```
3-Dot Button:
- Background: white (rgb(255, 255, 255))
- Hover: white (same, opacity 100%)
- Icon: gray (default)

Info Box:
- Background: muted/gray (#f5f5f5)
- Text: dark/muted-foreground
- Border: subtle

Dialog:
- Background: white
- Border: light gray
- Title: bold, 18px
- Description: gray, 14px

Radio Buttons:
- Circle: default gray
- Selected: primary color (blue)
- Label: black

Textarea:
- Border: subtle gray
- Focus: primary color outline
- Placeholder: light gray

Buttons:
- Primary: blue background
- Hover: darker blue
- Disabled: gray
```

---

## 🔄 Interaction States

### Button States
```
Default:
[Gửi báo cáo]

Hover:
[Gửi báo cáo] ← Darker/highlighted

Loading:
[Đang gửi...] ← Text change, disabled

Success:
✓ (Toast notification appears)

Error:
✗ (Error message appears)
```

### Radio Button States
```
Unselected:
○ Spam hoặc quảng cáo

Hover:
⭕ Spam hoặc quảng cáo (slightly darker)

Selected:
◉ Spam hoặc quảng cáo (filled, primary color)
```

### Textarea States
```
Empty:
┌────────────────────┐
│ Nhập lý do...      │ ← Placeholder
└────────────────────┘

Focus (user typing):
┌────────────────────┐
│ Nội dung không...  │ ← Cursor blinking
└────────────────────┘ ← Blue border

With Text:
┌────────────────────┐
│ Nội dung này rất... │
│ không phù hợp vì... │
│                    │
└────────────────────┘
```

---

## 📐 Dimensions

### Dialog
```
Max Width: 448px (28rem)
Width Mobile: Full - 32px padding (both sides)
Height: Auto, scrollable if needed
Border Radius: 8px
```

### Buttons
```
Height: 40px (h-10)
Padding: 8px 16px
Border Radius: 4px
Font Size: 14px
```

### Textarea
```
Width: 100%
Min Height: 96px (6 lines)
Padding: 8px 12px
Border Radius: 4px
Line Height: 1.5
```

### Radio Buttons
```
Circle: 20px diameter
Label Gap: 8px spacing
Line Height: 24px (clickable area)
```

### Info Box
```
Padding: 12px
Border Radius: 6px
Background: Muted (light gray)
Font Size: 14px (label), 14px (content)
```

---

## 🎯 Responsive Breakpoints

### Desktop (1024px+)
- Dialog: 448px width centered
- Buttons: full width stacked
- Grid: responsive, 2 columns for reasons

### Tablet (768px - 1023px)
- Dialog: 90vw (90% viewport width)
- Buttons: full width
- Readable, comfortable spacing

### Mobile (<768px)
- Dialog: 90vw (90% viewport width)
- Touch targets: 44px+ height
- Textarea: easier to scroll
- Stack layout

---

## ✨ Visual Hierarchy

```
Title ("Báo cáo"):
- Font: Bold, 18px
- Color: Black
- Margin: 16px bottom

Description:
- Font: Regular, 14px
- Color: Gray (muted-foreground)
- Margin: 8px bottom

Section Headers ("Lý do báo cáo:"):
- Font: Medium, 14px
- Color: Black
- Margin: 16px top, 12px bottom

Radio Labels:
- Font: Regular, 14px
- Color: Black
- Margin: 8px bottom (item gap)

Textarea Label:
- Font: Medium, 14px
- Color: Black
- Margin: 8px bottom

Button:
- Font: Semi-bold, 14px
- Color: White
- Padding: 10px 16px
- Margin: 16px top
```

---

## 🎬 Animation & Transitions

### Dialog Open/Close
```
Speed: 200ms
Type: Fade in/out
Curve: ease-out
```

### Textarea Show/Hide
```
When "Lý do khác" selected:
- Appears with fade-in
- Smooth transition
- Speed: 150ms
```

### Button Hover
```
Transition: background-color 200ms ease
Effect: Slight color darkening
```

### Toast Notification
```
Appear: Slide from bottom + fade in
Duration: 3 seconds (auto-dismiss)
Disappear: Fade out
```

---

**Visual Design Complete** ✅  
**Ready for Implementation** 🚀  
**User-Friendly & Professional** 🎨

