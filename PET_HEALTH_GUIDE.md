# Hướng Dẫn Sử Dụng Trang Chi Tiết Bài Đăng Pet

## 📋 Tổng Quan

Trang chi tiết bài đăng thú cưng đã được nâng cấp với giao diện mới đẹp hơn và tính năng hồ sơ y tế chi tiết.

## 🎯 Các Tính Năng Chính

### 1. **Hiển thị thông tin bài đăng**
   - Tiêu đề bài đăng
   - Ảnh chính của thú cưng
   - Trạng thái (Thất lạc, Tìm thấy, Cần nhà, Cứu hộ)
   - Địa điểm
   - Mô tả chi tiết
   - Các tag liên quan

### 2. **Thông tin chi tiết về thú cưng** (Pet Info Card)
   - Hiển thị trong phần main content sau mô tả
   - Bao gồm:
     - Tên, tuổi, giới tính, cân nặng
     - Kích thước, giống loài, màu sắc
     - Tính cách (badges)
     - Ảnh của thú cưng
     - Nhu cầu đặc biệt (nếu có)
     - Tiểu sử (bio)

### 3. **Hồ sơ Y Tế Chi Tiết** (Sidebar)
   - **Card Pet Overview** hiển thị:
     - Ảnh thú cưng
     - Thông tin cơ bản
     - Trạng thái sức khỏe nhanh
     - Nút "Xem hồ sơ y tế"
   
   - **Dialog Hồ Sơ Y Tế** bao gồm 4 tab:
     1. **Tổng quan (Overview)**
        - Thông tin cơ bản
        - Tính cách & đặc điểm
        - Trạng thái sức khỏe

     2. **Tiêm Chủng (Vaccinations)**
        - Danh sách các loại vaccine đã tiêm
        - Ngày tiêm
        - Ngày lần tiêm tiếp theo

     3. **Lịch Sử Y Tế (Medical History)**
        - Các tình trạng sức khỏe quá khứ
        - Điều trị áp dụng
        - Ghi chú từ bác sĩ

     4. **Chi Tiết (Details)**
        - Biểu đồ cân nặng
        - Ghi chú y tế

### 4. **Thông tin người đăng bài**
   - Tên, avatar
   - Ngày đăng bài
   - Nút gọi điện trực tiếp
   - Nút gửi tin nhắn

### 5. **Các hành động khác**
   - Chia sẻ bài đăng
   - Báo cáo bài đăng không phù hợp

## 📁 Cấu Trúc Thư Mục

```
components/
├── pet-health-profile.tsx          # Component hiển thị hồ sơ y tế (4 tabs)
├── pet-health-profile-dialog.tsx   # Dialog wrapper cho hồ sơ y tế
├── pet-info-card.tsx               # Card hiển thị thông tin chi tiết pet
└── pet-post-card.tsx               # Card hiển thị trong danh sách

app/
└── pet/
    └── [slug]/
        └── page.tsx                # Trang chi tiết bài đăng

lib/
├── types.ts                        # Định nghĩa interface PetHealthRecord, PetProfile
└── pet-posts.ts                    # Dữ liệu mẫu với hồ sơ y tế
```

## 🔧 Cách Mở Rộng

### Thêm Pet Profile mới
```typescript
// Trong pet-posts.ts
{
  id: "6",
  title: "...",
  // ... các trường khác
  pet: {
    id: "pet6",
    name: "Tên thú cưng",
    type: "Loài",
    breed: "Giống",
    age: 12, // tháng
    gender: "male" | "female",
    color: "Màu sắc",
    size: "small" | "medium" | "large",
    weight: 5.5, // kg
    personality: ["đặc điểm1", "đặc điểm2"],
    specialNeeds: "Mô tả nhu cầu đặc biệt",
    bio: "Tiểu sử ngắn",
    healthRecord: {
      id: "health6",
      vaccinations: [...],
      medicalHistory: [...],
      weight: [...],
      lastCheckup: "2024-11-01",
      allergies: [],
      notes: "Ghi chú"
    },
    photos: ["url1", "url2"]
  }
}
```

## 🎨 Thiết Kế Giao Diện

### Layout Chính
- **Main Content (2/3 chiều rộng)**
  - Ảnh bài đăng
  - Tiêu đề & thông tin cơ bản
  - Địa điểm
  - Mô tả chi tiết
  - **Pet Info Card** (mới)
  - Các tag

- **Sidebar (1/3 chiều rộng)**
  - Pet Info Card (Tổng quan nhanh + nút xem hồ sơ)
  - Thông tin người đăng
  - Các nút hành động
  - Thông tin bổ sung

### Màu Sắc
- **Pet Info Card**: Gradient từ primary/5 đến transparent
- **Health Status**: 
  - Green (Tiêm chủng cập nhật)
  - Blue (Kiểm tra gần đây)
  - Yellow (Nhu cầu đặc biệt)
  - Orange (Dị ứng)

## 🚀 Tiếp Theo

### Tính năng có thể thêm
1. Upload ảnh thú cưng
2. Lịch sử chỉnh sửa hồ sơ y tế
3. Nhắc nhở tiêm chủng tự động
4. So sánh nhiều pet
5. Xuất hồ sơ y tế dạng PDF
6. Chat trực tiếp trong app
7. Đánh giá người đăng bài

## ✅ Kiểm Tra Trước Khi Deploy

- [ ] Kiểm tra responsive design trên mobile
- [ ] Verify dữ liệu mẫu đầy đủ
- [ ] Test dialog mở/đóng hồ sơ y tế
- [ ] Verify tabs hoạt động đúng
- [ ] Check hình ảnh tải đúng
- [ ] Test link gọi điện
- [ ] Verify chuyển hướng quay lại danh sách

---

**Cập nhật lần cuối:** November 2024
**Phiên bản:** 1.0.0

