# ⚡ Report System - Quick Start

---

## 🎯 What You Get

**3-dot menu button** on every post card that opens a **report popup** with:
- ✅ 2 tabs: Report Post & Report User
- ✅ 7 reasons to choose from (select only 1)
- ✅ "Lý do khác" option with custom text input
- ✅ Form validation
- ✅ Success/error notifications

---

## 🚀 How It Works

### Step 1: Find Post Card
Go to any page with posts (shop, posts list, etc.)

### Step 2: Click 3-Dot Menu
Click the **3 chấm dọc** icon on top-right of post image

### Step 3: Click "Báo cáo"
Select "Báo cáo" from dropdown menu

### Step 4: Choose Tab
- **Báo cáo bài đăng** = Report the post
- **Báo cáo người dùng** = Report the user

### Step 5: Select Reason
Click one radio button to select a reason

### Step 6: (Optional) Add Custom Reason
If selected "Lý do khác":
1. Textarea appears
2. Type your custom reason
3. Min 1 character required

### Step 7: Submit
Click "Gửi báo cáo" button
- Shows "Đang gửi..." while submitting
- Success toast on complete
- Dialog closes automatically

---

## 📋 Report Reasons

### Tab 1: Báo cáo bài đăng (Report Post)
```
○ Spam hoặc quảng cáo
○ Nội dung không phù hợp
○ Quấy rối hoặc bắt nạt
○ Lừa đảo hoặc gian dối
○ Hành hạ động vật
○ Thông tin sai lệch
○ Lý do khác ← Choose this for custom input
```

### Tab 2: Báo cáo người dùng (Report User)
```
○ Spam hoặc quảng cáo
○ Hành vi không phù hợp
○ Quấy rối hoặc bắt nạt
○ Lừa đảo hoặc gian dối
○ Hành vi nguy hiểm
○ Giả mạo
○ Lý do khác ← Choose this for custom input
```

---

## 🎨 Visual Location

```
Post Card
┌─────────────────────────────────┐
│ ... [VIEWS] [3-DOT MENU] [❤️]  │
│            ↑                     │
│     Click here!                  │
│                                  │
│      [POST IMAGE]                │
│                                  │
└─────────────────────────────────┘
```

---

## ✅ Validation Rules

**Must select a reason:**
- If you click "Gửi báo cáo" without selecting → Error message

**If selecting "Lý do khác":**
- Textarea appears
- Must enter at least 1 character
- Can't submit empty

---

## 💾 What Gets Submitted

```
{
  type: "post" or "user",
  postId: "xxx" (if post report),
  userId: "xxx" (if user report),
  reason: "spam", "inappropriate", etc.,
  otherReason: "Your text here..." (only if "Lý do khác")
}
```

---

## 🧪 Quick Test

```
1. Go to shop page (has post cards)
2. Find any post
3. Click 3-dot menu (top-right of image)
4. See "Báo cáo" option
5. Click it
6. Dialog appears
7. Select "Báo cáo bài đăng" tab
8. Select "Lý do khác"
9. Type "Test report"
10. Click "Gửi báo cáo"
11. See success toast
12. Dialog closes

✅ It works!
```

---

## 🔗 Files

**Main:**
- `components/report-dialog.tsx` - The report dialog component
- `components/pet-post-card.tsx` - Updated with 3-dot menu

**Documentation:**
- `REPORT_SYSTEM.md` - Complete guide with code examples

---

## 🎯 Features

| Feature | Status |
|---------|--------|
| 3-dot menu button | ✅ |
| Report dialog | ✅ |
| 2 tabs | ✅ |
| Post reasons (7) | ✅ |
| User reasons (7) | ✅ |
| Custom reason input | ✅ |
| Single selection | ✅ |
| Validation | ✅ |
| Toast notifications | ✅ |
| Dialog close | ✅ |
| Form reset | ✅ |

---

## 🚀 API Connection (TODO)

Currently, report submission is logged to console.

To connect to real API:
1. Replace console.log with fetch/axios call
2. Endpoint: `POST /api/reports`
3. See REPORT_SYSTEM.md for request format

---

## ❓ FAQ

**Q: Can I select multiple reasons?**
A: No, only 1 reason (RadioGroup)

**Q: What if I make a mistake?**
A: Close dialog and open again (form resets)

**Q: Do I need to enter custom reason?**
A: Only if you select "Lý do khác" option

**Q: Where are reports stored?**
A: Backend database (API endpoint needed)

**Q: Can users see their reports?**
A: Not in current version (future feature)

---

## 📞 Need Help?

See `REPORT_SYSTEM.md` for:
- Code examples
- Component props
- Data structures
- API integration guide
- Full testing checklist

---

**Status:** ✅ Ready to Use  
**Version:** 1.0.0  
**Created:** November 21, 2025

