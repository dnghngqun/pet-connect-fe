# Hướng Dẫn Tính Năng Vị Trí Và Cứu Hộ (Location-Based Features)

## Tổng Quan

Dự án PetConnect bây giờ bao gồm một bộ tính năng dựa trên vị trí để giúp người dùng:
- **Tìm thú cưng gần nhất** trong bán kính người dùng chỉ định
- **Xác định vị trí các trung tâm cứu hộ** gần nhất
- **Xem tất cả vị trí trên bản đồ tương tác**
- **Nhận thông báo** khi có thú cưng hoặc trung tâm cứu hộ gần

## Các Tính Năng Chi Tiết

### 1. Tìm Thú Cưng Gần Bạn (Nearby Pets)

**File:** `components/nearby-pets.tsx`

**Chức năng:**
- Sử dụng Geolocation API để lấy vị trí hiện tại của người dùng
- Tính khoảng cách giữa người dùng và các thú cưng
- Hiển thị danh sách thú cưng trong vòng bán kính (mặc định 5km)
- Sắp xếp theo khoảng cách tăng dần

**Cách sử dụng:**
```tsx
<NearbyPets 
  pets={petPosts} 
  radiusKm={10}      // Bán kính tìm kiếm (km)
  maxResults={10}    // Số lượng kết quả tối đa
/>
```

### 2. Trung Tâm Cứu Hộ Gần Bạn (Nearby Rescue Centers)

**File:** `components/nearby-rescue-centers.tsx`

**Chức năng:**
- Tìm các trung tâm cứu hộ trong bán kính người dùng
- Hiển thị đánh giá, giờ hoạt động, chuyên môn
- Cung cấp liên kết gọi điện thoại và chỉ đường

**Dữ liệu:** `lib/rescue-centers.ts`
- Chứa danh sách 5 trung tâm cứu hộ mẫu
- Mỗi trung tâm có thông tin liên hệ, vị trí tọa độ, đánh giá

**Cách sử dụng:**
```tsx
<NearbyRescueCenters 
  radiusKm={15}  // Bán kính tìm kiếm
  limit={10}     // Số lượng kết quả
/>
```

### 3. Bản Đồ Tương Tác (Interactive Map)

**File:** `components/map-component.tsx`

**Công nghệ:** Leaflet.js + OpenStreetMap

**Tính năng:**
- Hiển thị vị trí của người dùng (marker xanh)
- Hiển thị các thú cưng trên bản đồ (marker tròn)
- Hiển thị các trung tâm cứu hộ (marker xanh)
- Popup thông tin khi click vào marker

**Cách sử dụng:**
```tsx
<MapComponent
  userLocation={{ latitude: 10.7769, longitude: 106.7009 }}
  rescueCenters={rescueCenters}
  pets={petPosts}
  height="600px"
/>
```

### 4. Hệ Thống Thông Báo (Notification System)

**File:** `services/notificationService.ts`

**Tính năng:**
- Lưu thông báo trong localStorage
- Hỗ trợ Web Notifications API
- Quản lý trạng thái đã đọc/chưa đọc
- Xóa thông báo

**Hooks:** `hooks/useNotifications.ts`

**Component:** `components/notification-center.tsx`

**Cách sử dụng:**
```tsx
const { notifications, unreadCount, markAsRead } = useNotifications(userId)
```

**Tạo thông báo:**
```tsx
import { notificationService } from '@/services/notificationService'

notificationService.createNotification(
  userId,
  'nearby-pets',
  'Thú cưng gần bạn!',
  'Có một con chó gần vị trí của bạn'
)
```

## Cấu Trúc Dữ Liệu

### Location Coordinates
```typescript
interface LocationCoords {
  latitude: number
  longitude: number
}
```

### Thêm vào PetPost
```typescript
export interface PetPost {
  // ... other fields
  locationCoords?: {
    latitude: number
    longitude: number
  }
}
```

### RescueCenter
```typescript
export interface RescueCenter {
  id: string
  name: string
  location: Location
  phone: string
  email?: string
  website?: string
  hours?: string
  specialties?: string[] // "dog", "cat", "bird", etc.
  distance?: number      // km từ người dùng
  rating?: number
  reviewCount?: number
}
```

## Utility Functions

### Location Utils (`lib/location-utils.ts`)

- **calculateDistance()**: Tính khoảng cách giữa 2 điểm (công thức Haversine)
- **getUserLocation()**: Lấy vị trí hiện tại của người dùng
- **getAddressFromCoordinates()**: Reverse Geocoding (Nominatim API)
- **filterNearbyPets()**: Lọc pets gần người dùng
- **getTimeAgo()**: Hiển thị thời gian tương đối

### Rescue Centers Utils (`lib/rescue-centers.ts`)

- **findNearbyRescueCenters()**: Tìm trung tâm cứu hộ gần nhất

## Trang Khám Phá Gần Bạn

**URL:** `/nearby`
**File:** `app/nearby/page.tsx`

**Tính năng:**
- Hiệu ứng bật/tắt định vị
- 3 tab: Thú cưng gần bạn, Trung tâm cứu hộ, Bản đồ
- Thông tin sử dụng và quyền riêng tư

## Quyền Riêng Tư & Bảo Mật

✅ **Vị trí của người dùng chỉ được lưu trên thiết bị**
✅ **Không gửi lên máy chủ**
✅ **Người dùng kiểm soát quyền định vị**
✅ **Không chia sẻ với bên thứ ba**

## API Bên Ngoài Được Sử Dụng

1. **Geolocation API** (Browser)
   - Lấy vị trí người dùng
   - Yêu cầu quyền từ người dùng

2. **Nominatim API** (OpenStreetMap)
   - Reverse geocoding
   - Chuyển tọa độ thành địa chỉ
   - Miễn phí, không cần API key

3. **Leaflet.js**
   - Thư viện bản đồ
   - Sử dụng OpenStreetMap tiles

## Cài Đặt & Chạy

```bash
# Cài đặt dependencies
pnpm install

# Chạy dev server
pnpm dev

# Truy cập
http://localhost:3000/nearby
```

## Dữ Liệu Mẫu

### Pet Posts với Locations
- Husky thất lạc tại Quận 1: (10.7769, 106.7009)
- Golden Retriever cần nhà tại Quận 7: (10.8256, 106.7331)

### Rescue Centers (5 trung tâm)
- Tọa độ tập trung ở TP.HCM
- Có thông tin liên hệ, đánh giá, giờ hoạt động

## Phát Triển Tiếp Theo

- [ ] Tích hợp Backend API để lưu location
- [ ] Thêm tính năng "Follow" cho rescue centers
- [ ] Notification khi có thú cưng mới gần vị trí
- [ ] Lịch sử tìm kiếm gần bạn
- [ ] Chia sẻ vị trí để giúp tìm thú cưng thất lạc
- [ ] Tích hợp Google Maps (trả phí)

## Troubleshooting

### Geolocation không hoạt động
- Kiểm tra quyền trình duyệt
- Sử dụng HTTPS (không HTTP)
- Kiểm tra bảo mật trình duyệt

### Bản đồ không hiển thị
- Kiểm tra CDN Leaflet
- Xóa cache trình duyệt
- Kiểm tra console lỗi

### Không có kết quả gần bạn
- Tăng bán kính tìm kiếm
- Thêm dữ liệu mẫu có locationCoords

