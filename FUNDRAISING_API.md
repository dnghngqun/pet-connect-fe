# API Documentation - Fundraising & Donation Feature

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Examples](#requestresponse-examples)
4. [Database Schema](#database-schema)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)

---

## Overview

Phần Gây quỹ & Quyên góp cho phép người dùng tạo chiến dịch cứu hộ động vật và nhận được quyên góp từ cộng đồng.

**Base URL:** `http://localhost:8080/api`

**Features:**
- 📋 Tạo & quản lý chiến dịch gây quỹ
- 💳 Xử lý thanh toán quyên góp
- 📊 Dashboard & thống kê
- 🔔 Thông báo khi có người đóng góp
- 🎯 Theo dõi tiến độ chiến dịch

---

## API Endpoints

### 1. Campaigns (Chiến dịch)

#### 1.1 Get All Campaigns
```
GET /fundraising/campaigns
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `active`, `completed`, `cancelled` (optional) |
| category | string | `medical`, `rescue`, `shelter`, `food`, `other` (optional) |
| page | number | Số trang (default: 1) |
| limit | number | Số item per trang (default: 20) |
| sort | string | `newest`, `trending`, `popular` (default: `newest`) |

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "campaign-1",
        "title": "Cứu chó Husky bị tai nạn",
        "slug": "cuu-cho-husky-tai-nan",
        "description": "Giúp chó Husky bị tai nạn được chữa trị...",
        "image": "https://...",
        "category": "medical",
        "targetAmount": 5000000,
        "currentAmount": 3500000,
        "currency": "VND",
        "status": "active",
        "progress": 70,
        "startDate": "2024-11-01T00:00:00Z",
        "endDate": "2024-12-31T23:59:59Z",
        "createdBy": {
          "id": "user-1",
          "name": "Nguyễn Văn A",
          "avatar": "https://..."
        },
        "relatedPet": {
          "id": "pet-1",
          "name": "Max",
          "image": "https://...",
          "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX..."
        },
        "totalDonors": 45,
        "createdAt": "2024-11-01T00:00:00Z",
        "updatedAt": "2024-12-10T10:00:00Z"
      }
    ],
    "total": 120,
    "page": 1,
    "pageSize": 20,
    "totalPages": 6
  }
}
```

#### 1.2 Get Campaign Details
```
GET /fundraising/campaigns/{campaignId}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "id": "campaign-1",
    "title": "Cứu chó Husky bị tai nạn",
    "slug": "cuu-cho-husky-tai-nan",
    "description": "Giúp chó Husky bị tai nạn được chữa trị và phục hồi",
    "descriptionDetailed": "Max là chú Husky bị tai nạn giao thông...",
    "image": "https://...",
    "category": "medical",
    "targetAmount": 5000000,
    "currentAmount": 3500000,
    "currency": "VND",
    "status": "active",
    "progress": 70,
    "startDate": "2024-11-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "createdBy": {
      "id": "user-1",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatar": "https://...",
      "phone": "0912345678"
    },
    "beneficiary": "Trạm Cứu Hộ PetAid",
    "relatedPet": {
      "id": "pet-1",
      "name": "Max",
      "type": "Husky",
      "breed": "Siberian Husky",
      "age": 36,
      "image": "https://...",
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX..."
    },
    "updates": [
      {
        "id": "update-1",
        "title": "Max đã qua phẫu thuật thành công",
        "content": "Sau 3 giờ phẫu thuật, Max đã tỉnh dậy an toàn...",
        "images": ["https://..."],
        "createdAt": "2024-12-08T14:30:00Z"
      }
    ],
    "donations": [
      {
        "id": "donation-1",
        "amount": 500000,
        "donorName": "Trần Thị B",
        "message": "Cố lên Max ơi!",
        "isAnonymous": false,
        "createdAt": "2024-12-08T10:30:00Z"
      }
    ],
    "totalDonors": 45,
    "totalDonations": 3500000,
    "createdAt": "2024-11-01T00:00:00Z",
    "updatedAt": "2024-12-10T10:00:00Z"
  }
}
```

#### 1.3 Create Campaign (Authenticated)
```
POST /fundraising/campaigns
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Cứu chó Husky bị tai nạn",
  "description": "Giúp chó Husky bị tai nạn được chữa trị...",
  "descriptionDetailed": "Chi tiết chi tiết...",
  "image": "https://...",
  "category": "medical",
  "targetAmount": 5000000,
  "currency": "VND",
  "endDate": "2024-12-31T23:59:59Z",
  "beneficiary": "Trạm Cứu Hộ PetAid",
  "relatedPetId": "pet-1"
}
```

**Response:** `201 Created`
```json
{
  "code": "0000",
  "message": "Tạo chiến dịch thành công",
  "data": {
    "id": "campaign-1",
    "slug": "cuu-cho-husky-tai-nan",
    "title": "Cứu chó Husky bị tai nạn",
    "status": "active",
    "createdAt": "2024-12-10T10:00:00Z"
  }
}
```

#### 1.4 Update Campaign (Authenticated - Creator only)
```
PUT /fundraising/campaigns/{campaignId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Cứu chó Husky (Cập nhật)",
  "description": "Mô tả mới...",
  "image": "https://...",
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Cập nhật thành công",
  "data": {
    "id": "campaign-1",
    "title": "Cứu chó Husky (Cập nhật)",
    "updatedAt": "2024-12-10T11:00:00Z"
  }
}
```

#### 1.5 Delete Campaign (Authenticated - Creator only)
```
DELETE /fundraising/campaigns/{campaignId}
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Xóa chiến dịch thành công"
}
```

---

### 2. Campaign Updates (Cập nhật chiến dịch)

#### 2.1 Add Campaign Update (Authenticated - Creator only)
```
POST /fundraising/campaigns/{campaignId}/updates
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Max đã qua phẫu thuật thành công",
  "content": "Sau 3 giờ phẫu thuật, Max đã tỉnh dậy an toàn...",
  "images": ["https://...", "https://..."]
}
```

**Response:** `201 Created`
```json
{
  "code": "0000",
  "message": "Thêm cập nhật thành công",
  "data": {
    "id": "update-1",
    "title": "Max đã qua phẫu thuật thành công",
    "createdAt": "2024-12-10T12:00:00Z"
  }
}
```

#### 2.2 Get Campaign Updates
```
GET /fundraising/campaigns/{campaignId}/updates
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "update-1",
        "campaignId": "campaign-1",
        "title": "Max đã qua phẫu thuật thành công",
        "content": "Sau 3 giờ phẫu thuật...",
        "images": ["https://..."],
        "createdAt": "2024-12-08T14:30:00Z"
      }
    ],
    "total": 5
  }
}
```

---

### 3. Donations (Quyên góp)

#### 3.1 Create Donation
```
POST /fundraising/donations
Content-Type: application/json
Authorization: Bearer {token} (Optional - for anonymous donation)
```

**Request Body:**
```json
{
  "campaignId": "campaign-1",
  "amount": 500000,
  "currency": "VND",
  "message": "Cố lên Max ơi!",
  "isAnonymous": false,
  "paymentMethod": "momo",
  "donorEmail": "donor@example.com"
}
```

**Response:** `201 Created`
```json
{
  "code": "0000",
  "message": "Quyên góp thành công",
  "data": {
    "id": "donation-1",
    "campaignId": "campaign-1",
    "amount": 500000,
    "status": "pending",
    "paymentUrl": "https://payment-gateway.com/...",
    "createdAt": "2024-12-10T13:00:00Z"
  }
}
```

#### 3.2 Get Campaign Donations (Donation Wall)
```
GET /fundraising/campaigns/{campaignId}/donations
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Số trang (default: 1) |
| limit | number | Số item per trang (default: 50) |
| sort | string | `newest`, `highest` (default: `newest`) |

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "donation-1",
        "amount": 500000,
        "currency": "VND",
        "message": "Cố lên Max ơi!",
        "donorName": "Trần Thị B",
        "isAnonymous": false,
        "paymentMethod": "momo",
        "status": "completed",
        "createdAt": "2024-12-08T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 50
  }
}
```

#### 3.3 Get User Donations (Authenticated)
```
GET /fundraising/donations/my-donations
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "donation-1",
        "campaignId": "campaign-1",
        "campaignTitle": "Cứu chó Husky bị tai nạn",
        "amount": 500000,
        "status": "completed",
        "paymentMethod": "momo",
        "createdAt": "2024-12-08T10:30:00Z"
      }
    ],
    "total": 12
  }
}
```

#### 3.4 Payment Callback (Webhook)
```
POST /fundraising/donations/callback
Content-Type: application/json
X-Signature: {signature}
```

**Request Body (từ Payment Gateway):**
```json
{
  "donationId": "donation-1",
  "status": "completed",
  "transactionId": "momo-trans-12345",
  "amount": 500000,
  "timestamp": "2024-12-08T10:35:00Z",
  "signature": "signature_hash"
}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Webhook xử lý thành công"
}
```

---

### 5. Pet QR Code (Mã QR thú cưng)

#### 5.1 Get Pet QR Code
```
GET /fundraising/campaigns/{campaignId}/pet/qr-code
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "petId": "pet-1",
    "petName": "Max",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX...",
    "encodedUrl": "https://petconnect.vn/pet/cho-husky-mat-tich-quan-1",
    "format": "png",
    "size": "300x300",
    "generatedAt": "2024-12-10T10:00:00Z"
  }
}
```

#### 5.2 Download Pet QR Code
```
GET /fundraising/campaigns/{campaignId}/pet/qr-code/download
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | `png`, `jpg`, `svg` (default: `png`) |
| size | number | `100`, `200`, `300`, `500` (default: `300`) |

**Response:** `200 OK` (Binary image file)

#### 5.3 Get Pet Details with QR
```
GET /fundraising/campaigns/{campaignId}/pet
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "id": "pet-1",
    "name": "Max",
    "type": "Husky",
    "breed": "Siberian Husky",
    "age": 36,
    "gender": "male",
    "color": "Trắng xám",
    "weight": 28,
    "size": "large",
    "personality": ["hiếu kỳ", "năng động", "thân thiện", "thông minh"],
    "specialNeeds": "Không có",
    "bio": "Max là một chú Husky 3 tuổi...",
    "photos": [
      "https://images.unsplash.com/photo-1574158622682...",
      "https://..."
    ],
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJI...",
    "healthRecord": {
      "id": "health-1",
      "lastCheckup": "2024-09-15",
      "vaccinations": [
        {
          "name": "Rabies",
          "date": "2024-09-15",
          "nextDue": "2025-09-15"
        }
      ],
      "medicalHistory": [
        {
          "date": "2024-09-15",
          "condition": "Khám sức khỏe thường niên",
          "treatment": "Kiểm tra toàn thân, Tiêm vaccine",
          "notes": "Tình trạng tốt"
        }
      ],
      "weight": [
        {
          "date": "2024-09-15",
          "value": 28
        }
      ],
      "allergies": ["Thịt gà"],
      "notes": "Cần tập thể dục thường xuyên"
    }
  }
}
```

---

### 4. Dashboard (Authenticated - Creator)

#### 4.1 Get My Campaigns
```
GET /fundraising/my-campaigns
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `active`, `completed`, `cancelled` |
| page | number | Số trang |

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "campaign-1",
        "title": "Cứu chó Husky bị tai nạn",
        "status": "active",
        "targetAmount": 5000000,
        "currentAmount": 3500000,
        "progress": 70,
        "totalDonors": 45,
        "createdAt": "2024-11-01T00:00:00Z"
      }
    ],
    "total": 5
  }
}
```

#### 4.2 Get Campaign Analytics
```
GET /fundraising/campaigns/{campaignId}/analytics
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "campaignId": "campaign-1",
    "totalRaised": 3500000,
    "targetAmount": 5000000,
    "progress": 70,
    "totalDonors": 45,
    "averageDonation": 77777.78,
    "dailyDonations": [
      {
        "date": "2024-12-08",
        "amount": 750000,
        "donorCount": 5
      }
    ],
    "donationsByMethod": {
      "momo": 1500000,
      "zalopay": 1200000,
      "bank": 800000,
      "card": 0
    },
    "views": 2450,
    "shares": 145
  }
}
```

---

## Request/Response Examples

### Example 1: User creates a campaign

**Step 1: Create Campaign**
```bash
curl -X POST http://localhost:8080/api/fundraising/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "title": "Cứu chó Husky bị tai nạn",
    "description": "Giúp chó Husky bị tai nạn được chữa trị...",
    "image": "https://images.unsplash.com/photo-1574158622682...",
    "category": "medical",
    "targetAmount": 5000000,
    "currency": "VND",
    "endDate": "2024-12-31T23:59:59Z",
    "beneficiary": "Trạm Cứu Hộ PetAid",
    "relatedPetId": "pet-1"
  }'
```

**Response:**
```json
{
  "code": "0000",
  "message": "Tạo chiến dịch thành công",
  "data": {
    "id": "campaign-new-1",
    "slug": "cuu-cho-husky-tai-nan",
    "status": "active"
  }
}
```

### Example 2: User donates to campaign

**Step 1: Create Donation Request**
```bash
curl -X POST http://localhost:8080/api/fundraising/donations \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-1",
    "amount": 500000,
    "currency": "VND",
    "message": "Cố lên Max ơi!",
    "isAnonymous": false,
    "paymentMethod": "momo",
    "donorEmail": "user@example.com"
  }'
```

**Response:**
```json
{
  "code": "0000",
  "message": "Quyên góp thành công",
  "data": {
    "id": "donation-1",
    "amount": 500000,
    "status": "pending",
    "paymentUrl": "https://payment-gateway.com/pay?id=donation-1",
    "redirectUrl": "https://petconnect.vn/fundraising/cuu-cho-husky-tai-nan"
  }
}
```

**Step 2: User redirected to Payment Gateway**
- User scans QR code hoặc nhập số điện thoại
- Xác nhận và thanh toán
- Payment Gateway gọi callback
- **Note:** Người quyên góp cũng có thể quét mã QR của thú cưng để xem chi tiết hồ sơ sức khỏe

**Step 3: Backend Webhook Callback**
```bash
POST http://localhost:8080/api/fundraising/donations/callback \
  -H "Content-Type: application/json" \
  -H "X-Signature: signature_hash" \
  -d '{
    "donationId": "donation-1",
    "status": "completed",
    "transactionId": "momo-trans-12345",
    "amount": 500000
  }'
```

---

## Database Schema

### Table: fundraising_campaigns
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID |
| title | VARCHAR(255) | NOT NULL | Tiêu đề chiến dịch |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| description | TEXT | NOT NULL | Mô tả ngắn |
| description_detailed | LONGTEXT | | Mô tả chi tiết |
| image | VARCHAR(500) | | Ảnh đại diện |
| category | VARCHAR(50) | NOT NULL | `medical`, `rescue`, `shelter`, `food`, `other` |
| target_amount | BIGINT | NOT NULL | Mục tiêu quyên góp |
| current_amount | BIGINT | DEFAULT 0 | Số tiền hiện tại |
| currency | VARCHAR(10) | DEFAULT 'VND' | Loại tiền |
| status | VARCHAR(50) | DEFAULT 'active' | `active`, `paused`, `completed`, `cancelled` |
| created_by_id | BIGINT | NOT NULL, FK | User ID |
| beneficiary | VARCHAR(255) | | Tổ chức hưởng lợi |
| related_pet_id | VARCHAR(36) | FK | Pet ID |
| start_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày bắt đầu |
| end_date | TIMESTAMP | | Ngày kết thúc |
| views | INT | DEFAULT 0 | Số lượt xem |
| shares | INT | DEFAULT 0 | Số lượt chia sẻ |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
```sql
CREATE INDEX idx_status ON fundraising_campaigns(status);
CREATE INDEX idx_category ON fundraising_campaigns(category);
CREATE INDEX idx_created_by_id ON fundraising_campaigns(created_by_id);
CREATE INDEX idx_slug ON fundraising_campaigns(slug);
CREATE INDEX idx_created_at ON fundraising_campaigns(created_at DESC);
```

### Table: campaign_updates
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID |
| campaign_id | VARCHAR(36) | NOT NULL, FK | Campaign ID |
| title | VARCHAR(255) | NOT NULL | Tiêu đề cập nhật |
| content | LONGTEXT | NOT NULL | Nội dung cập nhật |
| images | JSON | | Array of image URLs |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
```sql
CREATE INDEX idx_campaign_id ON campaign_updates(campaign_id);
```

### Table: donations
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID |
| campaign_id | VARCHAR(36) | NOT NULL, FK | Campaign ID |
| donor_id | BIGINT | FK | User ID (NULL if anonymous) |
| amount | BIGINT | NOT NULL | Số tiền quyên góp |
| currency | VARCHAR(10) | DEFAULT 'VND' | Loại tiền |
| message | TEXT | | Lời nhắn |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Ẩn danh? |
| payment_method | VARCHAR(50) | NOT NULL | `momo`, `zalopay`, `bank`, `card` |
| payment_id | VARCHAR(255) | | ID từ payment gateway |
| status | VARCHAR(50) | DEFAULT 'pending' | `pending`, `completed`, `failed` |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
```sql
CREATE INDEX idx_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donor_id ON donations(donor_id);
CREATE INDEX idx_status ON donations(status);
CREATE INDEX idx_created_at ON donations(created_at DESC);
```

### Table: campaign_analytics
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | BIGINT | PRIMARY KEY AUTO_INCREMENT | |
| campaign_id | VARCHAR(36) | NOT NULL, FK, UNIQUE | Campaign ID |
| total_views | INT | DEFAULT 0 | Tổng lượt xem |
| total_shares | INT | DEFAULT 0 | Tổng lượt chia sẻ |
| total_donors | INT | DEFAULT 0 | Tổng số người quyên góp |
| total_raised | BIGINT | DEFAULT 0 | Tổng tiền quyên góp |
| average_donation | DECIMAL(12,2) | | Trung bình quyên góp |
| last_donation_at | TIMESTAMP | | Lần quyên góp gần nhất |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

## Error Handling

### Error Response Format
```json
{
  "code": "error_code",
  "message": "Error message in Vietnamese",
  "data": null,
  "errors": [
    {
      "field": "title",
      "message": "Tiêu đề không được để trống"
    }
  ]
}
```

### Common Error Codes
| Code | Status | Message |
|------|--------|---------|
| 0000 | 200 | Thành công |
| 4001 | 400 | Dữ liệu không hợp lệ |
| 4002 | 400 | Số tiền không hợp lệ |
| 4003 | 400 | Chiến dịch không tồn tại |
| 4004 | 400 | Quyên góp không tồn tại |
| 4011 | 401 | Chưa đăng nhập |
| 4031 | 403 | Không có quyền truy cập |
| 5001 | 500 | Lỗi server |
| 5002 | 500 | Lỗi thanh toán |

### Example Error Response
```json
{
  "code": "4002",
  "message": "Số tiền quyên góp phải >= 10,000 VND",
  "data": null
}
```

---

## Authentication

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjM3MjYxNjIsImV4cCI6MTc2MzcyOTc2Mn0.signature
```

### Token Refresh
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## Rate Limiting

- **Campaign Creation:** 5 campaigns per user per month
- **Donation:** No limit
- **API Calls:** 100 requests per minute per IP

---

## Webhooks

### Supported Events
- `donation.created` - Khi có quyên góp mới
- `donation.completed` - Khi thanh toán hoàn tất
- `campaign.milestone` - Khi đạt mục tiêu
- `campaign.completed` - Khi chiến dịch kết thúc

### Webhook Configuration
```bash
POST /webhooks/configure
Authorization: Bearer {token}

{
  "url": "https://your-server.com/webhook",
  "events": ["donation.completed", "campaign.milestone"],
  "secret": "your_webhook_secret"
}
```

---

**Last Updated:** December 10, 2025
**API Version:** v1.0

