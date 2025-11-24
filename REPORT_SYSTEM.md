# 📝 Report System - Implementation Guide

---

## 🎯 What Was Implemented

Complete report system with 3-dot menu button on post cards that opens a popup with 2 tabs:
1. **Báo cáo bài đăng** (Report Post)
2. **Báo cáo người dùng** (Report User)

---

## ✨ Features

### Post Card 3-Dot Menu Button
- Location: Top-right of post image (next to views count)
- Icon: MoreVertical (3 chấm dọc)
- Color: White background with hover effect
- Action: Click to open report dialog

### Report Dialog - 2 Tabs

#### Tab 1: Báo cáo bài đăng (Report Post)
**Report Reasons:**
- ✓ Spam hoặc quảng cáo
- ✓ Nội dung không phù hợp
- ✓ Quấy rối hoặc bắt nạt
- ✓ Lừa đảo hoặc gian dối
- ✓ Hành hạ động vật
- ✓ Thông tin sai lệch
- ✓ Lý do khác

**Features:**
- Select only ONE reason (RadioGroup)
- If "Lý do khác" selected: Show textarea to input custom reason
- Display post title in info box
- Submit button with loading state

#### Tab 2: Báo cáo người dùng (Report User)
**Report Reasons:**
- ✓ Spam hoặc quảng cáo
- ✓ Hành vi không phù hợp
- ✓ Quấy rối hoặc bắt nạt
- ✓ Lừa đảo hoặc gian dối
- ✓ Hành vi nguy hiểm
- ✓ Giả mạo
- ✓ Lý do khác

**Features:**
- Same as post report (select 1 reason)
- If "Lý do khác" selected: Show textarea
- Display user name in info box
- Submit button with loading state

### User Experience
- Dialog opens when clicking 3-dot menu
- Shows selected post/user name for confirmation
- Clear radio buttons with labels
- Textarea for "Lý do khác" (custom reason)
- Validation: reason required, custom reason required if selected
- Toast notifications (success/error)
- Dialog closes on success
- Form resets after submission

---

## 📁 Files Created & Modified

### Created (1 file)
```
components/report-dialog.tsx
├─ ReportDialog component
├─ 2 tabs (post, user)
├─ 7 post reasons + custom
├─ 7 user reasons + custom
├─ RadioGroup for single selection
├─ Textarea for custom reason
├─ Toast notifications
├─ API call placeholder
└─ ~200 lines
```

### Modified (1 file)
```
components/pet-post-card.tsx
├─ Import ReportDialog
├─ Import MoreVertical, Flag icons
├─ Import DropdownMenu components
├─ Add reportDialogOpen state
├─ Add 3-dot menu button (top-right)
├─ Add DropdownMenu with Report option
├─ Add ReportDialog component
└─ ~50 lines added
```

---

## 🔄 Data Flow

### Opening Report Dialog
```
User clicks 3-dot button
    ↓
DropdownMenu opens
    ↓
User clicks "Báo cáo"
    ↓
Dialog opens with 2 tabs
```

### Selecting Reason
```
User clicks radio button
    ↓
Reason state updates
    ↓
If reason === 'other':
    ↓
Show textarea for custom reason
```

### Submitting Report
```
User clicks "Gửi báo cáo"
    ↓
Validate: reason selected
    ↓
If other: validate custom reason filled
    ↓
Submit data:
  {
    type: 'post' | 'user',
    postId/userId: string,
    reason: string,
    otherReason?: string
  }
    ↓
Show success toast
    ↓
Close dialog
    ↓
Reset form
```

---

## 🎨 UI Layout

### Post Card with Report Button
```
┌─────────────────────────────┐
│ [IMAGE]      [VIEWS] [3...] │ ← 3-dot menu button
│             [❤️ favorite]   │
│             ❤️ at bottom-right
└─────────────────────────────┘

Dropdown Menu:
┌──────────────┐
│ 🚩 Báo cáo  │
└──────────────┘
```

### Report Dialog
```
┌─────────────────────────────────────────┐
│ Báo cáo                                 │
│ Giúp chúng tôi cải thiện cộng đồng... │
├─────────────────────────────────────────┤
│ [Báo cáo bài đăng] [Báo cáo người dùng]│
├─────────────────────────────────────────┤
│ Bài đăng: "Chó Husky mất tích..."       │
│                                         │
│ Lý do báo cáo:                          │
│ ○ Spam hoặc quảng cáo                  │
│ ○ Nội dung không phù hợp                │
│ ○ Quấy rối hoặc bắt nạt                │
│ ○ Lừa đảo hoặc gian dối                │
│ ○ Hành hạ động vật                      │
│ ○ Thông tin sai lệch                    │
│ ○ Lý do khác                            │
│                                         │
│ [Gửi báo cáo]                          │
└─────────────────────────────────────────┘

If "Lý do khác" selected:
┌─────────────────────────────────────────┐
│ Vui lòng mô tả lý do khác:              │
│ ┌───────────────────────────────────┐  │
│ │ Nhập lý do khác của bạn...        │  │
│ │                                   │  │
│ │                                   │  │
│ └───────────────────────────────────┘  │
│ [Gửi báo cáo]                          │
└─────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Using ReportDialog Component
```typescript
const [reportDialogOpen, setReportDialogOpen] = useState(false);

<ReportDialog
  open={reportDialogOpen}
  onOpenChange={setReportDialogOpen}
  postId={post.id}
  userId={post.postedBy?.id}
  postTitle={post.title}
  userName={post.postedBy?.name}
/>
```

### Handling Report Submission
```typescript
const handlePostReportSubmit = async () => {
  const reportData = {
    type: 'post',
    postId,
    reason: postReason,
    otherReason: postReason === 'other' ? postOtherReason : undefined,
  };
  
  // TODO: Call API
  // POST /api/reports
  
  toast({ title: 'Thành công', ... });
  onOpenChange(false);
};
```

---

## 🧪 Testing

### Test 1: Open Report Dialog
```
1. Go to shop/posts page
2. Find any post card
3. Click 3-dot menu button (top-right of image)
4. Should see dropdown with "Báo cáo" option
5. Click "Báo cáo"
6. Dialog should open with 2 tabs
```

### Test 2: Report Post
```
1. In "Báo cáo bài đăng" tab
2. See post title displayed
3. Select different reasons
4. Select "Lý do khác"
5. Textarea should appear
6. Enter custom reason
7. Click "Gửi báo cáo"
8. Should see success toast
9. Dialog should close
```

### Test 3: Report User
```
1. Click "Báo cáo người dùng" tab
2. See user name displayed
3. Select different user reasons
4. Select "Lý do khác"
5. Textarea should appear
6. Enter custom reason
7. Click "Gửi báo cáo"
8. Should see success toast
9. Dialog should close
```

### Test 4: Validation
```
1. Try submit without reason selected
2. Should see error: "Vui lòng chọn lý do báo cáo"
3. Select "Lý do khác" without entering reason
4. Should see error: "Vui lòng nhập lý do khác"
5. Enter custom reason
6. Should allow submit
```

### Test 5: Multiple Reports
```
1. Submit one report
2. Click 3-dot menu again
3. Dialog should reset (empty selection)
4. Should allow submitting another report
```

---

## 🔗 Component Props

### ReportDialog
```typescript
interface ReportDialogProps {
  open: boolean;                    // Dialog open state
  onOpenChange: (open: boolean) => void;  // Handle open/close
  postId?: string;                  // Post ID for report
  userId?: string;                  // User ID for report
  postTitle?: string;               // Post title for display
  userName?: string;                // User name for display
}
```

---

## 📊 Report Reasons

### Post Report (7 options)
1. spam - Spam hoặc quảng cáo
2. inappropriate - Nội dung không phù hợp
3. harassment - Quấy rối hoặc bắt nạt
4. scam - Lừa đảo hoặc gian dối
5. animal_abuse - Hành hạ động vật
6. misleading - Thông tin sai lệch
7. other - Lý do khác (custom input)

### User Report (7 options)
1. spam - Spam hoặc quảng cáo
2. inappropriate - Hành vi không phù hợp
3. harassment - Quấy rối hoặc bắt nạt
4. scam - Lừa đảo hoặc gian dối
5. dangerous - Hành vi nguy hiểm
6. impersonation - Giả mạo
7. other - Lý do khác (custom input)

---

## 🚀 Next Steps

### To Connect API
```typescript
// In report-dialog.tsx, replace TODO comments
const response = await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData)
});

if (response.ok) {
  // Show success
} else {
  // Show error
}
```

### Backend Endpoint Needed
```
POST /api/reports
Content-Type: application/json

{
  "type": "post" | "user",
  "postId": string (if post report),
  "userId": string (if user report),
  "reason": string,
  "otherReason": string (optional)
}

Response:
{
  "code": "0000",
  "message": "Báo cáo thành công",
  "data": {
    "id": string,
    "createdAt": datetime
  }
}
```

---

## ✅ Checklist

- [x] 3-dot menu button added
- [x] Report dialog created
- [x] 2 tabs implemented
- [x] Post reasons list
- [x] User reasons list
- [x] Custom reason textarea
- [x] Radio button selection
- [x] Validation logic
- [x] Toast notifications
- [x] Form reset on submit
- [x] Dialog close on success
- [x] No TypeScript errors
- [x] No React warnings

---

## 📝 Notes

- Report dialog is reusable (can be used elsewhere)
- Uses Shadcn UI components (Dialog, Tabs, RadioGroup, etc.)
- Toast notifications via use-toast hook
- API calls are placeholder (marked with TODO)
- Form validation on client-side
- Custom reason input only shows when "Lý do khác" selected
- Dialog closes after successful submission

---

**Status:** ✅ Complete  
**Created:** November 21, 2025  
**Version:** 1.0.0

