# 🧪 Testing Guide - Login & Avatar System

---

## ✅ Pre-Test Checklist

Trước khi test, đảm bảo:

- [ ] Backend API đang chạy: `http://localhost:8080`
- [ ] Frontend dev server đang chạy: `npm run dev` hoặc `pnpm dev`
- [ ] Duyệt web browser DevTools để check console errors
- [ ] Browser localStorage không bị xóa

---

## 🔍 Test Scenarios

### 1️⃣ Registration Test

**Mục tiêu:** Kiểm tra đăng ký tài khoản và auto-login

#### Steps:

1. **Navigate to Sign Up**
   - Go to `http://localhost:3000/sign-up`
   - Verify: Trang hiển thị form đăng ký

2. **Fill Form with Valid Data**
   ```
   Họ và Tên: Test User 123
   Email: test@example.com
   Số điện thoại: 0912345678
   Mật khẩu: Test@123456 (đủ yêu cầu: uppercase, lowercase, number, special char)
   Xác nhận: Test@123456
   Chọn: Đồng ý với điều khoản
   ```
   - Verify: Validation checkmarks appear ✅

3. **Submit Form**
   - Click "Tạo tài khoản" button
   - Verify: Toast notification "Đăng ký thành công"
   - Verify: Redirect to home page `/`

4. **Check Auto-Login**
   - Verify: Avatar appears in header (top-right)
   - Verify: No "Đăng nhập" & "Đăng ký" buttons visible
   - Verify: Can see user avatar (32x32 circle)

5. **Check localStorage**
   - Open DevTools → Application → localStorage
   - Verify: Key `pet-connect-user` exists
   - Verify: Contains: id, email, fullName, avatarUrl, roleCode, token

#### Expected localStorage Structure:
```json
{
  "id": 2,
  "email": "test@example.com",
  "fullName": "Test User 123",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
  "roleCode": "USER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### 2️⃣ Login Test

**Mục tiêu:** Kiểm tra đăng nhập tài khoản

#### Steps:

1. **Logout First** (nếu đang login)
   - Click avatar → "Đăng xuất"
   - Verify: Login buttons appear lại

2. **Navigate to Sign In**
   - Go to `http://localhost:3000/sign-in`
   - Verify: Form có email & password fields

3. **Enter Credentials**
   ```
   Email: test@example.com
   Password: Test@123456
   ```
   - Verify: Validation works
   - Verify: Green checkmarks appear

4. **Submit Form**
   - Click "Đăng nhập" button
   - Verify: Toast "Đăng nhập thành công"
   - Verify: Redirect to home `/`

5. **Check Header**
   - Verify: Avatar appears (different user = different avatar)
   - Verify: Can see user info on click

---

### 3️⃣ Avatar Display Test

**Mục tiêu:** Kiểm tra hiển thị avatar

#### Steps:

1. **Check Avatar Size**
   - Right-click avatar → Inspect
   - Verify: Class has `h-8 w-8` (32x32px)
   - Verify: Avatar is circular (border-radius)

2. **Check Different Avatars**
   - Register 3 different users
   - Verify: Each gets DIFFERENT avatar (từ 8 default)
   - Verify: Random selection works

3. **Check Avatar Persistence**
   - Login user
   - Refresh page (F5)
   - Verify: SAME avatar appears (not different one)
   - Explanation: localStorage stores avatarUrl

4. **Check Fallback Initials**
   - Open DevTools Network tab
   - Break image URL: Edit avatarUrl in localStorage
   - Refresh page
   - Verify: Initials show instead of broken image
   - Example: "Test User 123" → "TU"

---

### 4️⃣ Dropdown Menu Test

**Mục tiêu:** Kiểm tra dropdown menu

#### Steps:

1. **Click Avatar**
   - Login first
   - Click avatar in header
   - Verify: Dropdown menu appears
   - Verify: Smooth animation

2. **Check Menu Content**
   - Verify: Shows user fullName
   - Verify: Shows user email
   - Verify: "Trang cá nhân" link (blue text)
   - Verify: "Đăng xuất" button (red text)

3. **Click Trang Cá Nhân**
   - Click link
   - Verify: Navigate to `/profile`
   - Verify: Dropdown closes

4. **Test Dropdown Close**
   - Click avatar again → menu opens
   - Click outside menu → menu closes
   - Verify: Works smoothly

5. **Test Logout**
   - Click avatar → menu opens
   - Click "Đăng xuất"
   - Verify: Logout toast
   - Verify: Redirect to `/`
   - Verify: Login buttons appear
   - Verify: localStorage cleared

---

### 5️⃣ Responsive Design Test

**Mục tiêu:** Kiểm tra mobile & tablet

#### Desktop (> 768px)

```
Header Right:
├─ Search icon
├─ "Đăng bài" button
└─ Auth section:
   ├─ "Đăng nhập" button (if not logged in)
   ├─ "Đăng ký" button (if not logged in)
   └─ Avatar (if logged in)
```

#### Mobile (< 768px)

```
Header Right:
├─ Search icon
└─ Auth section:
   ├─ User icon button (if not logged in) → /sign-in
   └─ Avatar (if logged in)
```

#### Test Steps:

1. **Desktop Test**
   - Open DevTools → Toggle device toolbar
   - Set width > 768px (Desktop)
   - Verify: Login/Register buttons visible
   - Verify: Gap between buttons (gap-2)

2. **Mobile Test**
   - Set width < 768px (Mobile)
   - Verify: Only icon visible (not buttons)
   - Verify: Avatar still clickable

3. **Tablet Test**
   - Set width ~800px
   - Verify: Proper layout

---

### 6️⃣ Validation Test

**Mục tiêu:** Kiểm tra form validation

#### Invalid Email

```
Email: invalid.email
Error message: "Email không hợp lệ"
Check: Red X icon appears
Submit: Button disabled (nếu implement)
```

#### Invalid Phone

```
Phone: 12345
Error: "Số điện thoại không hợp lệ"
Valid: 0912345678 hoặc +84912345678
```

#### Weak Password

```
Password: password123 (no uppercase, no special char)
Error: "Mật khẩu phải có... @$!%*?&"
Required: min 8 chars, uppercase, lowercase, number, special
```

#### Password Mismatch

```
Password: Test@123456
Confirm: Test@123457
Error: "Mật khẩu nhập lại không khớp"
```

#### Missing Required Fields

```
Leave any field empty
Error: "Vui lòng nhập..."
Submit: Form not submitted
```

---

### 7️⃣ Error Handling Test

**Mục tiêu:** Kiểm tra error scenarios

#### Duplicate Email

```
Register với email: test@example.com
Register lại với email: test@example.com
Expected: Error toast "Email đã tồn tại"
Backend should return: 409 Conflict
```

#### Wrong Password

```
Login với email: test@example.com
Password: WrongPassword
Expected: Error toast "Đăng nhập thất bại"
Backend should return: 401 Unauthorized
```

#### Network Error

```
Disconnect internet
Try to login
Expected: Error toast "Đã có lỗi xảy ra"
Should show: Network error message
```

#### Expired Token

```
Login user
Wait > token expiration time
Try to access protected resource
Expected: Auto logout & redirect to /sign-in
```

---

### 8️⃣ Browser Compatibility Test

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ✅ |
| Edge | ✅ | ✅ |

#### Test on each:
- [ ] Avatar loads
- [ ] Dropdown works
- [ ] Form submits
- [ ] localStorage works
- [ ] No console errors

---

### 9️⃣ Performance Test

**Mục tiêu:** Kiểm tra performance

#### Metrics:

```
Page Load Time: < 3 seconds
Avatar Load: < 1 second
Dropdown Open: Instant
Form Submit: < 2 seconds
```

#### DevTools Performance:

1. Open DevTools → Performance tab
2. Start recording
3. Click avatar
4. Open dropdown
5. Stop recording
6. Check: Smooth 60 FPS
7. Verify: No layout shifts (CLS)

---

## 📋 Test Checklist

### Registration

- [ ] Form validation works
- [ ] All fields required
- [ ] Email validation
- [ ] Phone validation
- [ ] Password strength
- [ ] Submit sends API call
- [ ] Success toast appears
- [ ] Redirect to home
- [ ] Avatar appears
- [ ] Auto-login works
- [ ] localStorage saved

### Login

- [ ] Form fields appear
- [ ] Email validation works
- [ ] Password validation works
- [ ] Submit sends API call
- [ ] Error handling works
- [ ] Success toast appears
- [ ] Redirect to home
- [ ] Avatar appears

### Avatar

- [ ] Size correct (32x32)
- [ ] Circular shape
- [ ] Different for each user
- [ ] Persists on refresh
- [ ] Initials fallback works
- [ ] Cached in localStorage

### Dropdown

- [ ] Opens on click
- [ ] Shows user info
- [ ] Links work
- [ ] Logout works
- [ ] Closes on outside click
- [ ] Responsive

### Header

- [ ] Desktop: buttons or avatar
- [ ] Mobile: icon or avatar
- [ ] Loading state handled
- [ ] Smooth transitions
- [ ] No layout shift

### Responsive

- [ ] Desktop: gap-2 between buttons
- [ ] Mobile: icons only
- [ ] Tablet: proper layout
- [ ] Touch-friendly sizes
- [ ] No horizontal scroll

### Errors

- [ ] Validation messages appear
- [ ] Error toast shows
- [ ] Form highlights errors
- [ ] Focus moved to error field
- [ ] Timeout handling

---

## 🔧 Debug Tips

### Check localStorage

```javascript
// In console
const user = JSON.parse(localStorage.getItem('pet-connect-user'))
console.log(user)

// Should show:
{
  id: number,
  email: string,
  fullName: string,
  avatarUrl: string,
  roleCode: string,
  token: string
}
```

### Check API Response

```javascript
// In Network tab
// POST /api/auth/login
// Response should have data with avatarUrl
```

### Simulate Network Error

```javascript
// In console
localStorage.clear() // Clear data
// Refresh page - should show login buttons again
```

### Force Avatar Fallback

```javascript
// In console
const user = JSON.parse(localStorage.getItem('pet-connect-user'))
user.avatarUrl = "https://invalid-url.com/avatar.jpg"
localStorage.setItem('pet-connect-user', JSON.stringify(user))
// Refresh - should show initials
```

---

## 📊 Test Report Template

```markdown
# Test Report - Login & Avatar System

**Date:** November 21, 2025
**Tester:** [Your Name]
**Environment:** 
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Browser: [Chrome/Firefox/Safari/Edge]

## Summary
- Total Tests: 50
- Passed: 50
- Failed: 0
- Skipped: 0

## Issues Found
None

## Sign-Off
✅ Ready for production

```

---

**Last Updated:** November 21, 2025  
**Version:** 1.0.0

