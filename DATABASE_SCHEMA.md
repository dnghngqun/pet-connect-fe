# Database Schema - PetConnect

## Mô Tả Chung

Database cho ứng dụng PetConnect bao gồm các bảng chính để quản lý:
- Thú cưng (Pets)
- Hồ sơ y tế thú cưng (Pet Health Records)
- Bài đăng (Posts)
- Bình luận (Comments)
- Thông báo (Notifications)

---

## 1. Bảng USERS (Người Dùng)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID người dùng duy nhất (Primary Key) |
| username | String | ✓ | Tên đăng nhập (unique) |
| email | String | ✓ | Email (unique) |
| password | String | ✓ | Mật khẩu đã hash |
| fullName | String | ✓ | Họ và tên |
| phone | String | ✓ | Số điện thoại |
| avatar | String | ✗ | URL ảnh đại diện |
| bio | Text | ✗ | Tiểu sử / mô tả |
| address | String | ✗ | Địa chỉ |
| city | String | ✗ | Thành phố |
| district | String | ✗ | Quận / Huyện |
| postalCode | String | ✗ | Mã bưu chính |
| isVerified | Boolean | ✓ | Đã xác thực email hay chưa (default: false) |
| isActive | Boolean | ✓ | Tài khoản có hoạt động hay không (default: true) |
| role | Enum | ✓ | Vai trò: USER, ORGANIZATION, ADMIN (default: USER) |
| createdAt | DateTime | ✓ | Thời gian tạo tài khoản |
| updatedAt | DateTime | ✓ | Thời gian cập nhật cuối cùng |
| lastLogin | DateTime | ✗ | Lần đăng nhập cuối cùng |

### Ví dụ Dữ Liệu:
```
id: "uuid-1001"
username: "nguyen_van_a"
email: "a@example.com"
password: "$2b$10$hashedpassword123"
fullName: "Nguyễn Văn A"
phone: "0912345678"
avatar: "https://cloudinary.com/avatar/user1.jpg"
bio: "Yêu thích các thú cưng"
address: "123 Đường Lê Lợi"
city: "TP. Hồ Chí Minh"
district: "Quận 1"
role: "USER"
createdAt: "2024-11-01T10:00:00Z"
```

---

## 2. Bảng PETS (Thú Cưng)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID thú cưng duy nhất (Primary Key) |
| userId | UUID / String | ✓ | ID chủ sở hữu (Foreign Key → USERS.id) |
| name | String | ✓ | Tên thú cưng |
| type | String | ✓ | Loại: Chó, Mèo, Chim, Thỏ, v.v |
| breed | String | ✓ | Giống loài: Husky, Golden Retriever, v.v |
| gender | Enum | ✓ | Giới tính: MALE, FEMALE |
| age | Integer | ✓ | Tuổi (tính bằng tháng) |
| weight | Float | ✗ | Cân nặng (kg) |
| color | String | ✗ | Màu sắc |
| size | Enum | ✗ | Kích thước: SMALL, MEDIUM, LARGE |
| personality | String[] | ✗ | Mảng tính cách: ["thân thiện", "vui vẻ", ...] |
| specialNeeds | Text | ✗ | Nhu cầu đặc biệt |
| bio | Text | ✗ | Tiểu sử |
| profilePhoto | String | ✗ | URL ảnh đại diện |
| createdAt | DateTime | ✓ | Thời gian tạo hồ sơ |
| updatedAt | DateTime | ✓ | Thời gian cập nhật cuối cùng |

### Ví dụ Dữ Liệu:
```
id: "pet-2001"
userId: "uuid-1001"
name: "Max"
type: "Chó"
breed: "Husky"
gender: "MALE"
age: 36
weight: 28.5
color: "Trắng xám"
size: "LARGE"
personality: ["hiếu kỳ", "năng động", "thân thiện"]
specialNeeds: "Không có"
bio: "Max là chú Husky hoạt động, thích chơi đùa"
profilePhoto: "https://cloudinary.com/pets/max.jpg"
createdAt: "2024-10-01T10:00:00Z"
```

---

## 3. Bảng PET_HEALTH_RECORDS (Hồ Sơ Y Tế)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID hồ sơ y tế (Primary Key) |
| petId | UUID / String | ✓ | ID thú cưng (Foreign Key → PETS.id) |
| userId | UUID / String | ✓ | ID chủ sở hữu (Foreign Key → USERS.id) |
| lastCheckup | DateTime | ✗ | Ngày kiểm tra sức khỏe gần nhất |
| weight | Float | ✗ | Cân nặng hiện tại (kg) |
| notes | Text | ✗ | Ghi chú chung |
| allergies | String[] | ✗ | Mảng dị ứng: ["Thịt gà", "Đậu phộng"] |
| createdAt | DateTime | ✓ | Thời gian tạo bản ghi |
| updatedAt | DateTime | ✓ | Thời gian cập nhật cuối cùng |

### Ví dụ Dữ Liệu:
```
id: "health-3001"
petId: "pet-2001"
userId: "uuid-1001"
lastCheckup: "2024-09-15T10:00:00Z"
weight: 28.5
notes: "Cần tập thể dục thường xuyên"
allergies: ["Thịt gà"]
createdAt: "2024-09-15T10:00:00Z"
```

---

## 4. Bảng VACCINATIONS (Tiêm Chủng)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID tiêm chủng (Primary Key) |
| healthRecordId | UUID / String | ✓ | ID hồ sơ y tế (Foreign Key → PET_HEALTH_RECORDS.id) |
| name | String | ✓ | Tên vaccine: Rabies, DHPP, Bordetella |
| vaccinationDate | DateTime | ✓ | Ngày tiêm |
| nextDueDate | DateTime | ✗ | Ngày tiêm lần tiếp theo |
| veterinarian | String | ✗ | Tên bác sĩ thú y |
| clinic | String | ✗ | Tên phòng khám |
| notes | Text | ✗ | Ghi chú bổ sung |
| createdAt | DateTime | ✓ | Thời gian tạo bản ghi |

### Ví dụ Dữ Liệu:
```
id: "vac-4001"
healthRecordId: "health-3001"
name: "Rabies"
vaccinationDate: "2024-09-15T14:30:00Z"
nextDueDate: "2025-09-15T14:30:00Z"
veterinarian: "Bác sĩ Nguyễn"
clinic: "Phòng khám thú y An Phú"
notes: "Tiêm vào cơ bắp đùi trái"
createdAt: "2024-09-15T14:30:00Z"
```

---

## 5. Bảng MEDICAL_HISTORY (Lịch Sử Y Tế)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID bản ghi y tế (Primary Key) |
| healthRecordId | UUID / String | ✓ | ID hồ sơ y tế (Foreign Key → PET_HEALTH_RECORDS.id) |
| visitDate | DateTime | ✓ | Ngày khám bệnh |
| condition | String | ✓ | Tình trạng / Chẩn đoán |
| treatment | Text | ✓ | Phương pháp điều trị |
| veterinarian | String | ✗ | Tên bác sĩ thú y |
| clinic | String | ✗ | Tên phòng khám |
| notes | Text | ✗ | Ghi chú bổ sung |
| cost | Float | ✗ | Chi phí khám (VNĐ) |
| createdAt | DateTime | ✓ | Thời gian tạo bản ghi |

### Ví dụ Dữ Liệu:
```
id: "med-5001"
healthRecordId: "health-3001"
visitDate: "2024-09-15T10:00:00Z"
condition: "Khám sức khỏe thường niên"
treatment: "Kiểm tra toàn thân, Tiêm vaccine"
veterinarian: "Bác sĩ Trần Minh"
clinic: "Phòng khám thú y Petcare"
notes: "Tình trạng tốt, không có vấn đề gì"
cost: 500000
createdAt: "2024-09-15T10:00:00Z"
```

---

## 6. Bảng WEIGHT_TRACKING (Theo Dõi Cân Nặng)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID bản ghi (Primary Key) |
| healthRecordId | UUID / String | ✓ | ID hồ sơ y tế (Foreign Key → PET_HEALTH_RECORDS.id) |
| weight | Float | ✓ | Cân nặng (kg) |
| recordDate | DateTime | ✓ | Ngày ghi nhận |
| notes | Text | ✗ | Ghi chú |
| createdAt | DateTime | ✓ | Thời gian tạo bản ghi |

### Ví dụ Dữ Liệu:
```
id: "weight-6001"
healthRecordId: "health-3001"
weight: 28.5
recordDate: "2024-09-15T10:00:00Z"
notes: "Cân nặng ổn định"
createdAt: "2024-09-15T10:00:00Z"
```

---

## 7. Bảng PET_POSTS (Bài Đăng)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID bài đăng (Primary Key) |
| petId | UUID / String | ✗ | ID thú cưng (Foreign Key → PETS.id) |
| userId | UUID / String | ✓ | ID người đăng (Foreign Key → USERS.id) |
| title | String | ✓ | Tiêu đề bài đăng |
| slug | String | ✓ | URL slug (unique) |
| description | Text | ✓ | Mô tả chi tiết |
| image | String | ✓ | URL ảnh chính |
| petType | String | ✓ | Loại thú cưng: Chó, Mèo, v.v |
| status | Enum | ✓ | Trạng thái: LOST, FOUND, FOR_ADOPTION, RESCUE |
| location | String | ✓ | Địa điểm: "Quận 1, TP.HCM" |
| city | String | ✓ | Thành phố |
| district | String | ✗ | Quận / Huyện |
| latitude | Float | ✗ | Vĩ độ (cho bản đồ) |
| longitude | Float | ✗ | Kinh độ (cho bản đồ) |
| tags | String[] | ✗ | Mảng tags: ["lost", "husky", "urgent"] |
| views | Integer | ✓ | Số lượt xem (default: 0) |
| featured | Boolean | ✓ | Bài đăng nổi bật (default: false) |
| isActive | Boolean | ✓ | Bài đăng còn hoạt động (default: true) |
| createdAt | DateTime | ✓ | Thời gian đăng bài |
| updatedAt | DateTime | ✓ | Thời gian cập nhật cuối cùng |

### Ví dụ Dữ Liệu:
```
id: "post-7001"
petId: "pet-2001"
userId: "uuid-1001"
title: "Chó Husky mất tích tại quận 1, TP.HCM"
slug: "cho-husky-mat-tich-quan-1"
description: "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh..."
image: "https://cloudinary.com/posts/post1.jpg"
petType: "Husky"
status: "LOST"
location: "Quận 1, TP.HCM"
city: "TP. Hồ Chí Minh"
district: "Quận 1"
latitude: 10.7769
longitude: 106.7009
tags: ["lost", "husky", "urgent"]
views: 2450
featured: true
isActive: true
createdAt: "2024-11-04T10:30:00Z"
```

---

## 8. Bảng COMMENTS (Bình Luận)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID bình luận (Primary Key) |
| postId | UUID / String | ✓ | ID bài đăng (Foreign Key → PET_POSTS.id) |
| userId | UUID / String | ✓ | ID người bình luận (Foreign Key → USERS.id) |
| content | Text | ✓ | Nội dung bình luận |
| parentCommentId | UUID / String | ✗ | ID bình luận cha (nếu là trả lời) |
| likes | Integer | ✓ | Số lượng thích (default: 0) |
| isActive | Boolean | ✓ | Bình luận có hiển thị (default: true) |
| createdAt | DateTime | ✓ | Thời gian tạo bình luận |
| updatedAt | DateTime | ✓ | Thời gian cập nhật |

### Ví dụ Dữ Liệu:
```
id: "comment-8001"
postId: "post-7001"
userId: "uuid-1002"
content: "Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!"
parentCommentId: null
likes: 5
isActive: true
createdAt: "2024-11-04T11:00:00Z"
```

---

## 9. Bảng NOTIFICATIONS (Thông Báo)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID thông báo (Primary Key) |
| userId | UUID / String | ✓ | ID người nhận (Foreign Key → USERS.id) |
| fromUserId | UUID / String | ✗ | ID người gửi |
| postId | UUID / String | ✗ | ID bài đăng liên quan |
| type | Enum | ✓ | Loại: COMMENT, MESSAGE, POST_UPDATED, PET_FOUND |
| title | String | ✓ | Tiêu đề thông báo |
| content | Text | ✓ | Nội dung thông báo |
| link | String | ✗ | Link dẫn đến chi tiết |
| isRead | Boolean | ✓ | Đã đọc hay chưa (default: false) |
| createdAt | DateTime | ✓ | Thời gian gửi thông báo |

### Ví dụ Dữ Liệu:
```
id: "notif-9001"
userId: "uuid-1001"
fromUserId: "uuid-1002"
postId: "post-7001"
type: "COMMENT"
title: "Có bình luận mới trên bài đăng của bạn"
content: "Trần Thị B đã bình luận: 'Tôi thấy chú chó này ở công viên...'"
link: "/pet/cho-husky-mat-tich-quan-1"
isRead: false
createdAt: "2024-11-04T11:00:00Z"
```

---

## 10. Bảng FAVORITES / SAVED_POSTS (Bài Đăng Yêu Thích)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID bản ghi (Primary Key) |
| userId | UUID / String | ✓ | ID người dùng (Foreign Key → USERS.id) |
| postId | UUID / String | ✓ | ID bài đăng (Foreign Key → PET_POSTS.id) |
| createdAt | DateTime | ✓ | Thời gian lưu |

### Ví dụ Dữ Liệu:
```
id: "fav-10001"
userId: "uuid-1001"
postId: "post-7001"
createdAt: "2024-11-04T10:35:00Z"
```

---

## 11. Bảng MESSAGES (Tin Nhắn)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID tin nhắn (Primary Key) |
| senderId | UUID / String | ✓ | ID người gửi (Foreign Key → USERS.id) |
| receiverId | UUID / String | ✓ | ID người nhận (Foreign Key → USERS.id) |
| postId | UUID / String | ✗ | ID bài đăng liên quan |
| content | Text | ✓ | Nội dung tin nhắn |
| isRead | Boolean | ✓ | Đã đọc hay chưa (default: false) |
| readAt | DateTime | ✗ | Thời gian đọc |
| createdAt | DateTime | ✓ | Thời gian gửi |

### Ví dụ Dữ Liệu:
```
id: "msg-11001"
senderId: "uuid-1002"
receiverId: "uuid-1001"
postId: "post-7001"
content: "Chào bạn, tôi có thông tin về chú Husky của bạn"
isRead: false
createdAt: "2024-11-04T11:05:00Z"
```

---

## 12. Bảng ORGANIZATIONS (Tổ Chức Cứu Hộ)

| Trường | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|--------|--------------|---------|-------|
| id | UUID / String | ✓ | ID tổ chức (Primary Key) |
| userId | UUID / String | ✓ | ID tài khoản (Foreign Key → USERS.id) |
| name | String | ✓ | Tên tổ chức |
| description | Text | ✗ | Mô tả tổ chức |
| logo | String | ✗ | URL logo |
| website | String | ✗ | Website tổ chức |
| phone | String | ✓ | Số điện thoại liên hệ |
| email | String | ✓ | Email liên hệ |
| address | String | ✓ | Địa chỉ |
| city | String | ✓ | Thành phố |
| district | String | ✗ | Quận / Huyện |
| isVerified | Boolean | ✓ | Đã xác thực (default: false) |
| followerCount | Integer | ✓ | Số lượng người theo dõi (default: 0) |
| createdAt | DateTime | ✓ | Thời gian đăng ký |

### Ví dụ Dữ Liệu:
```
id: "org-12001"
userId: "uuid-1003"
name: "Trạm Cứu Hộ PetAid"
description: "Tổ chức cứu hộ chuyên giúp đỡ động vật"
logo: "https://cloudinary.com/orgs/petaid.jpg"
website: "https://petaid.vn"
phone: "0868888888"
email: "info@petaid.vn"
address: "456 Đường Nguyễn Hữu Cảnh"
city: "TP. Hồ Chí Minh"
district: "Quận 2"
isVerified: true
followerCount: 1250
createdAt: "2024-01-15T10:00:00Z"
```

---

## Mối Quan Hệ Giữa Các Bảng

```
USERS (1) ──── (N) PETS
  │
  ├──── (1) ──── (N) PET_POSTS
  │
  ├──── (1) ──── (N) PET_HEALTH_RECORDS
  │
  ├──── (1) ──── (N) COMMENTS
  │
  ├──── (1) ──── (N) NOTIFICATIONS
  │
  ├──── (1) ──── (N) MESSAGES
  │
  └──── (1) ──── (1) ORGANIZATIONS

PETS (1) ──── (1) PET_HEALTH_RECORDS
  │
  └──── (N) ──── (1) PET_POSTS

PET_HEALTH_RECORDS (1) ──── (N) VACCINATIONS
  │
  ├──── (N) ──── (1) MEDICAL_HISTORY
  │
  └──── (N) ──── (1) WEIGHT_TRACKING

PET_POSTS (1) ──── (N) COMMENTS
  │
  └──── (N) ──── (1) FAVORITES / SAVED_POSTS
```

---

## Chỉ Mục (Indexes) Cần Tạo

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Pets
CREATE INDEX idx_pets_userId ON pets(userId);
CREATE INDEX idx_pets_type ON pets(type);

-- Pet Posts
CREATE INDEX idx_petPosts_userId ON pet_posts(userId);
CREATE INDEX idx_petPosts_petId ON pet_posts(petId);
CREATE INDEX idx_petPosts_status ON pet_posts(status);
CREATE INDEX idx_petPosts_slug ON pet_posts(slug);
CREATE INDEX idx_petPosts_city ON pet_posts(city);
CREATE INDEX idx_petPosts_createdAt ON pet_posts(createdAt);

-- Comments
CREATE INDEX idx_comments_postId ON comments(postId);
CREATE INDEX idx_comments_userId ON comments(userId);

-- Messages
CREATE INDEX idx_messages_senderId ON messages(senderId);
CREATE INDEX idx_messages_receiverId ON messages(receiverId);

-- Notifications
CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_isRead ON notifications(isRead);

-- Health Records
CREATE INDEX idx_healthRecords_petId ON pet_health_records(petId);
CREATE INDEX idx_vaccinations_healthRecordId ON vaccinations(healthRecordId);
CREATE INDEX idx_medicalHistory_healthRecordId ON medical_history(healthRecordId);
```

---

## Constraints & Rules

### Validation Rules
1. **PETS**
   - Age phải > 0
   - Weight phải > 0 nếu có giá trị
   - Type phải thuộc danh sách cho phép

2. **PET_POSTS**
   - Title độ dài 5-200 ký tự
   - Description độ dài tối thiểu 10 ký tự
   - Status phải thuộc: LOST, FOUND, FOR_ADOPTION, RESCUE

3. **VACCINATIONS**
   - nextDueDate phải > vaccinationDate

4. **MESSAGES**
   - Content độ dài tối thiểu 1 ký tự, tối đa 5000 ký tự

---

## Dữ Liệu Mẫu Ban Đầu

```sql
-- Enum Types (nếu sử dụng PostgreSQL)
CREATE TYPE user_role AS ENUM ('USER', 'ORGANIZATION', 'ADMIN');
CREATE TYPE post_status AS ENUM ('LOST', 'FOUND', 'FOR_ADOPTION', 'RESCUE');
CREATE TYPE notification_type AS ENUM ('COMMENT', 'MESSAGE', 'POST_UPDATED', 'PET_FOUND');
CREATE TYPE pet_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE');
CREATE TYPE pet_gender AS ENUM ('MALE', 'FEMALE');
```

---

## Performance Tips

1. **Pagination**: Luôn sử dụng LIMIT và OFFSET khi truy vấn danh sách
2. **Denormalization**: Có thể lưu `viewCount` trên PET_POSTS để tránh COUNT queries
3. **Caching**: Cache danh sách bài đăng nổi bật (featured posts)
4. **Query Optimization**: 
   - Sử dụng JOIN thay vì N+1 queries
   - Select chỉ các cột cần thiết

---

**Cập nhật lần cuối:** November 2024
**Phiên bản:** 1.0.0

