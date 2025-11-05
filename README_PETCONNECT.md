# 🐾 PetConnect - Mạng xã hội Cứu hộ Thú cưng

## 📖 Giới thiệu

**PetConnect** là một nền tảng mạng xã hội kết nối cộng đồng cứu hộ động vật ở Việt Nam. Nó giúp:

- 🔍 **Tìm kiếm thú cưng thất lạc** - Đăng bài và nhận được thông báo từ cộng đồng
- 🏠 **Tìm nhà cho thú cưng** - Kết nối người muốn nhận nuôi với những bé cần gia đình
- 🆘 **Cứu hộ động vật** - Hỗ trợ các trạm cứu hộ chia sẻ thông tin
- 💬 **Kết nối cộng đồng** - Chat trực tiếp, giao tiếp về các vấn đề động vật

## 🚀 Tính năng chính

### 1. Danh sách bài đăng
- Xem tất cả bài đăng từ cộng đồng
- Lọc theo:
  - **Trạng thái**: Thất lạc, Tìm thấy, Cần nhà, Cứu hộ
  - **Loại thú cưng**: Chó, Mèo, Chim, Thỏ, Khác
  - **Địa điểm**: Tìm kiếm theo vị trí
  - **Sắp xếp**: Mới nhất, Cũ nhất, Lượt xem nhiều

### 2. Tạo bài đăng
- Đăng bài mới với thông tin chi tiết
- Chọn loại: Thất lạc, Tìm thấy, Cần nhà, Cứu hộ
- Chia sẻ vị trí, số điện thoại liên hệ

### 3. Chi tiết bài đăng
- Xem thông tin đầy đủ
- Liên hệ trực tiếp qua điện thoại
- Gửi tin nhắn (sắp ra mắt)
- Chia sẻ bài đăng
- Báo cáo nội dung không phù hợp

## 📁 Cấu trúc dự án

```
pet-store-1-0-0/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Trang chủ
│   ├── shop/page.tsx             # Danh sách bài đăng
│   ├── pet/[slug]/page.tsx       # Chi tiết bài đăng
│   ├── post/new/page.tsx         # Tạo bài đăng mới
│   ├── about/
│   ├── contact/
│   └── ...
│
├── components/                   # React Components
│   ├── pet-post-card.tsx         # Component bài đăng
│   ├── shop-filters.tsx          # Bộ lọc
│   ├── header.tsx                # Header navigation
│   ├── footer.tsx                # Footer
│   ├── hero-slider.tsx           # Banner
│   ├── theme-provider.tsx
│   └── ui/                       # Shadcn UI components
│
├── lib/                          # Utilities & Data
│   ├── pet-posts.ts              # Dữ liệu bài đăng mẫu
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts
│   └── products.ts               # Dữ liệu sản phẩm (legacy)
│
└── public/                       # Static files
```

## 🔧 Cài đặt

### Yêu cầu
- Node.js 18+ 
- npm hoặc pnpm

### Bước 1: Clone repository
```bash
cd pet-store-1-0-0
```

### Bước 2: Cài đặt dependencies
```bash
pnpm install
```

### Bước 3: Chạy development server
```bash
pnpm dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

## 📱 Các trang chính

| URL | Mô tả |
|-----|-------|
| `/` | Trang chủ |
| `/shop` | Danh sách bài đăng |
| `/shop?status=lost` | Bài đăng thú cưng thất lạc |
| `/shop?status=for-adoption` | Bài đăng cần nhà |
| `/pet/:slug` | Chi tiết bài đăng |
| `/post/new` | Tạo bài đăng mới |
| `/about` | Về chúng tôi |
| `/contact` | Liên hệ |

## 🎨 UI Components

Dự án sử dụng **Shadcn UI** với Tailwind CSS:
- Buttons, Cards, Badges
- Dialogs, Modals, Sheets
- Dropdowns, Menus
- Accordions, Tabs
- Responsive design

## 📊 Loại bài đăng

### 1️⃣ Thất lạc (Lost)
- Mô tả thú cưng mất tích
- Vị trí mất tích cuối cùng
- Ảnh và đặc điểm nhận dạng
- Số điện thoại liên hệ

**Ví dụ**: "Chó Husky mất tích tại Q.1, TP.HCM ngày 3/11"

### 2️⃣ Tìm thấy (Found)
- Mô tả thú cưng tìm thấy
- Vị trí tìm thấy
- Ảnh rõ ràng
- Các đặc điểm đặc biệt

**Ví dụ**: "Mèo cam tìm thấy tại công viên Tao Đàn"

### 3️⃣ Cần nhà (For Adoption)
- Thú cưng cần gia đình yêu thương
- Tình trạng sức khỏe
- Tính cách, thói quen
- Yêu cầu nhân nuôi

**Ví dụ**: "Chó Golden Retriever 2 tháng tuổi, khỏe mạnh, cần gia đình"

### 4️⃣ Cứu hộ (Rescue)
- Thú cưng được cứu hộ từ những tình huống nguy hiểm
- Tình trạng hiện tại
- Nhu cầu hỗ trợ (tài trợ, nhà, gia đình)
- Liên kết tới trạm cứu hộ

**Ví dụ**: "Mèo bị thương được cứu hộ, cần tài trợ chữa trị"

## 📱 Tính năng di động

- Responsive design cho tất cả kích thước màn hình
- Mobile-friendly navigation
- Touch-optimized buttons
- Fast loading

## 🔐 Bảo mật & Quyền riêng tư

- Thông tin liên hệ: Chỉ hiển thị số điện thoại
- Báo cáo nội dung: Có thể báo cáo bài đăng không phù hợp
- Privacy Policy: Xem `/privacy`

## 🚧 Tính năng sắp tới

- ✅ Chat realtime giữa người dùng
- ✅ Bản đồ hiển thị vị trí bài đăng
- ✅ Hệ thống đánh giá & tin tưởng
- ✅ Gây quỹ minh bạch cho trạm cứu hộ
- ✅ Hồ sơ sức khỏe thú cưng
- ✅ Notification system
- ✅ Advanced search with filters

## 👥 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Giấy phép

Dự án này được cấp phép dưới MIT License.

## 📞 Liên hệ & Hỗ trợ

- **Email**: support@petconnect.vn
- **Facebook**: facebook.com/petconnect
- **Website**: petconnect.vn

## 📝 Lịch sử thay đổi

Xem [`CHANGELOG_PETCONNECT.md`](./CHANGELOG_PETCONNECT.md) để biết chi tiết về các thay đổi.

---

**Cảm ơn bạn đã sử dụng PetConnect! 🐾**

