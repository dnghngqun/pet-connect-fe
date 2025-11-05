# PetConnect - Chuyển đổi từ Pet Shop sang Mạng xã hội Cứu hộ

## 📋 Tóm tắt thay đổi

Dự án đã được chuyển đổi từ một pet shop (bán hàng) thành **PetConnect** - một mạng xã hội kết nối cộng đồng cứu hộ động vật, tìm thú cưng thất lạc, và nhận nuôi.

## 🔄 Thay đổi chính

### 1. **Cấu trúc dữ liệu**
- ✅ Tạo interface `PetPost` để thay thế `Product`
- ✅ Tạo file `lib/pet-posts.ts` với dữ liệu mẫu cho các bài đăng thú cưng
- Các bài đăng bao gồm: **Thất lạc**, **Tìm thấy**, **Cần nhà**, **Cứu hộ**

### 2. **Trang chính (Home Page)**
- ✅ Cập nhật Hero Slider với nội dung về cứu hộ thú cưng
- ✅ Thay đổi Features Section từ "Delivery", "Return" sang "Cứu hộ động vật", "Kết nối theo địa điểm", v.v.
- ✅ Loại bỏ phần "Pet Categories" (phân chó/mèo riêng)
- ✅ Thêm "Featured Posts" và "Recent Posts" sections
- ✅ Cập nhật Newsletter Section

### 3. **Trang Shop/Danh sách**
- ✅ Chuyển đổi từ hiển thị sản phẩm sang hiển thị bài đăng thú cưng
- ✅ Thêm nút "Đăng bài mới"
- ✅ Hiển thị thông báo khi không có bài đăng nào

### 4. **Bộ lọc (Shop Filters)**
- ✅ Thay thế "Category" và "Price Range" bằng:
  - **Trạng thái**: Thất lạc, Tìm thấy, Cần nhà, Cứu hộ
  - **Loại thú cưng**: Chó, Mèo, Chim, Thỏ, Khác
  - **Địa điểm**: Tìm kiếm theo vị trí
  - **Sắp xếp**: Mới nhất, Cũ nhất, Lượt xem nhiều

### 5. **Component Pet Post Card**
- ✅ Tạo component mới `pet-post-card.tsx` để hiển thị bài đăng
- ✅ Hiển thị: Badge trạng thái, thông tin người đăng, nút Chat & Gọi
- ✅ Loại bỏ giá tiền, nút "Add to Cart"

### 6. **Trang chi tiết bài đăng (Pet Detail)**
- ✅ Tạo trang `/pet/[slug]/page.tsx`
- ✅ Hiển thị: hình ảnh, mô tả chi tiết, thông tin người đăng
- ✅ Nút liên hệ: Gọi điện, Gửi tin nhắn, Chia sẻ, Báo cáo

### 7. **Trang tạo bài đăng (New Post)**
- ✅ Tạo trang `/post/new/page.tsx`
- ✅ Form: Tiêu đề, Loại thú cưng, Trạng thái, Địa điểm, Mô tả, Số điện thoại
- ✅ (Placeholder cho upload ảnh)

### 8. **Header Navigation**
- ✅ Cập nhật branding từ "PetPals" sang "PetConnect"
- ✅ Loại bỏ Cart, Wishlist
- ✅ Thêm nút "Đăng bài" chính
- ✅ Cập nhật menu: Trang chủ, Danh sách bài đăng, Giới thiệu, Liên hệ
- ✅ Cập nhật text sang tiếng Việt

### 9. **Footer**
- ✅ Cập nhật branding
- ✅ Cập nhật các link điều hướng để phù hợp với PetConnect
- ✅ Thay đổi nội dung: Bỏ phần "Shipping", "Returns"

## 📱 Các loại bài đăng

| Trạng thái | Màu | Mô tả |
|-----------|-----|-------|
| Thất lạc | 🔴 Đỏ | Thú cưng mất tích cần tìm |
| Tìm thấy | 🔵 Xanh | Tìm thấy thú cưng cần tìm chủ |
| Cần nhà | 🟢 Xanh lá | Thú cưng cần nhà yêu thương |
| Cứu hộ | 🟠 Cam | Thú cưng được cứu hộ |

## 🔧 Tính năng sắp tới

- [ ] Chức năng chat giữa người dùng
- [ ] Hệ thống tải ảnh đúng quy chuẩn
- [ ] Bản đồ hiển thị vị trí bài đăng
- [ ] Hệ thống xác minh tài khoản
- [ ] Gây quỹ minh bạch cho trạm cứu hộ
- [ ] Hồ sơ sức khỏe thú cưng
- [ ] Thông báo khi có bài đăng gần vị trí

## 📁 Cấu trúc thư mục

```
app/
  ├── page.tsx (Trang chủ)
  ├── shop/page.tsx (Danh sách bài đăng)
  ├── pet/[slug]/page.tsx (Chi tiết bài đăng)
  └── post/new/page.tsx (Tạo bài đăng mới)

components/
  ├── pet-post-card.tsx (Component hiển thị bài đăng)
  ├── shop-filters.tsx (Bộ lọc)
  ├── header.tsx (Cập nhật)
  └── footer.tsx (Cập nhật)

lib/
  ├── pet-posts.ts (Dữ liệu bài đăng)
  ├── types.ts (Thêm PetPost interface)
  └── products.ts (Giữ lại cho sau này)
```

## ✅ Hoàn thành

Dự án PetConnect bây giờ đã sẵn sàng:
- ✅ Giao diện chính phù hợp với mục tiêu cứu hộ
- ✅ Các tính năng lọc và tìm kiếm
- ✅ Hệ thống liên hệ người dùng
- ✅ Responsive design cho mobile & desktop
- ✅ Tất cả text đã dịch sang tiếng Việt

---

**Bước tiếp theo**: 
1. Triển khai hệ thống xác thực người dùng
2. Thêm chức năng upload ảnh
3. Tích hợp chat realtime
4. Triển khai bản đồ vị trí

