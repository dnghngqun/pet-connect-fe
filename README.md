# 🐾 Pet Connect - Cộng Đồng Hỗ Trợ Nhận Nuôi Thú Cưng

<div align="center">


**Nền tảng kết nối yêu thương - Lan tòa nhân ái**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Tính Năng](#-tính-năng-chính) • [Cài Đặt](#-hướng-dẫn-cài-đặt) • [Sử Dụng](#-hướng-dẫn-sử-dụng) • [Demo](#-demo) • [Đóng Góp](#-đóng-góp)

</div>

---

## 📖 Giới Thiệu

**Pet Connect** là nền tảng cộng đồng trực tuyến toàn diện, được thiết kế để kết nối những người yêu thú cưng, hỗ trợ việc nhận nuôi, trao đổi và chăm sóc thú cưng một cách hiệu quả, an toàn và nhân văn.

### 🎯 Sứ Mệnh

- Giảm thiểu tình trạng thú cưng bị bỏ rơi
- Tạo cầu nối giữa người có thú cưng cần tìm chủ mới và người muốn nhận nuôi
- Xây dựng cộng đồng yêu thương động vật lành mạnh
- Cung cấp kiến thức và dịch vụ chăm sóc thú cưng chất lượng

---

## ✨ Tính Năng Chính

### 🏠 Nhận Nuôi Thú Cưng
- ✅ Đăng tin tìm chủ mới cho thú cưng
- ✅ Tìm kiếm thú cưng theo loài, giống, tuổi, khu vực
- ✅ Xem thông tin chi tiết về thú cưng (ảnh, tính cách, sức khỏe)
- ✅ Lọc theo nhiều tiêu chí (size, màu sắc, đặc điểm)

### 💬 Trao Đổi & Kết Nối
- ✅ Chat trực tuyến giữa người cho và người nhận
- ✅ Hệ thống đánh giá và phản hồi
- ✅ Xác minh người dùng để đảm bảo an toàn
- ✅ Chia sẻ kinh nghiệm nuôi thú cưng

### 🏥 Dịch Vụ Chăm Sóc
- ✅ Tìm kiếm bác sĩ thú y gần nhất
- ✅ Đặt lịch hẹn khám sức khỏe
- ✅ Dịch vụ grooming (tắm rửa, cắt tỉa lông)
- ✅ Khách sạn thú cưng (pet hotel)
- ✅ Huấn luyện và đào tạo thú cưng

### 📚 Cộng Đồng & Kiến Thức
- ✅ Diễn đàn chia sẻ kinh nghiệm
- ✅ Blog về chăm sóc thú cưng
- ✅ Hướng dẫn nuôi dưỡng cho người mới
- ✅ Sự kiện cộng đồng yêu thú cưng

### 👤 Quản Lý Cá Nhân
- ✅ Hồ sơ người dùng
- ✅ Quản lý danh sách thú cưng
- ✅ Wishlist (danh sách yêu thích)
- ✅ Giỏ hàng cho dịch vụ/sản phẩm
- ✅ Lịch sử giao dịch

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend Framework
- **Next.js 15.2.4** - React Framework với Server-Side Rendering
- **React 19** - UI Library
- **TypeScript 5** - Type-safe JavaScript

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS Framework
- **Radix UI** - Accessible Component Library
- **Lucide React** - Beautiful Icons
- **Shadcn/UI** - Re-usable Components

### Form & Validation
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **@hookform/resolvers** - Form Validation Integration

### Animation & Interactions
- **Tailwindcss Animate** - CSS Animations
- **Embla Carousel** - Carousel Component
- **Vaul** - Drawer Component
- **Sonner** - Toast Notifications

### State Management
- **React Context API** - Global State
- **React Hooks** - Local State

### Additional Libraries
- **date-fns** - Date Manipulation
- **cmdk** - Command Menu
- **class-variance-authority** - CSS Variants
- **clsx & tailwind-merge** - Class Name Management

---

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** phiên bản 18.x trở lên ([Tải tại đây](https://nodejs.org/))
- **npm** (đi kèm với Node.js) hoặc **pnpm** (khuyến nghị)
- **Git** ([Tải tại đây](https://git-scm.com/))
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)

### Kiểm tra phiên bản

```bash
node --version  # Nên >= v18.0.0
npm --version   # Nên >= 8.0.0
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Clone Repository

```bash
# Clone dự án về máy
git clone https://github.com/yourusername/pet-connect.git

# Di chuyển vào thư mục dự án
cd pet-connect
```

### Bước 2: Cài Đặt Dependencies

**Sử dụng npm:**
```bash
npm install
```

**Sử dụng pnpm (khuyến nghị - nhanh hơn):**
```bash
# Cài đặt pnpm nếu chưa có
npm install -g pnpm

# Cài đặt dependencies
pnpm install
```

**Sử dụng yarn:**
```bash
yarn install
```

### Bước 3: Cấu Hình Environment Variables (Tùy chọn)

Tạo file `.env.local` trong thư mục gốc:

```bash
cp .env.example .env.local
```

Chỉnh sửa file `.env.local` với thông tin của bạn:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database (nếu có)
DATABASE_URL=your_database_url

# Authentication (nếu có)
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Third-party Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 💻 Hướng Dẫn Sử Dụng

### Chạy Development Server

```bash
# Sử dụng npm
npm run dev

# Sử dụng pnpm
pnpm dev

# Sử dụng yarn
yarn dev
```

Mở trình duyệt và truy cập: **http://localhost:3000**

Ứng dụng sẽ tự động reload khi bạn chỉnh sửa code.

### Build cho Production

```bash
# Build ứng dụng
npm run build

# Hoặc
pnpm build
```

### Chạy Production Build

```bash
# Start production server
npm start

# Hoặc
pnpm start
```

### Kiểm Tra Lỗi Code (Linting)

```bash
npm run lint
```

---

## 📁 Cấu Trúc Dự Án

```
pet-connect/
├── 📂 app/                          # Next.js App Router
│   ├── 📄 layout.tsx               # Root layout
│   ├── 📄 page.tsx                 # Trang chủ
│   ├── 📄 globals.css              # Global styles
│   ├── 📂 about/                   # Trang giới thiệu
│   ├── 📂 shop/                    # Cửa hàng sản phẩm/dịch vụ
│   ├── 📂 product/[slug]/          # Chi tiết sản phẩm
│   ├── 📂 cart/                    # Giỏ hàng
│   ├── 📂 checkout/                # Thanh toán
│   ├── 📂 wishlist/                # Danh sách yêu thích
│   ├── 📂 sign-in/                 # Đăng nhập
│   ├── 📂 sign-up/                 # Đăng ký
│   ├── 📂 contact/                 # Liên hệ
│   ├── 📂 privacy/                 # Chính sách bảo mật
│   └── 📂 terms/                   # Điều khoản sử dụng
│
├── 📂 components/                   # React Components
│   ├── 📄 header.tsx               # Header component
│   ├── 📄 footer.tsx               # Footer component
│   ├── 📄 product-card.tsx         # Card hiển thị thú cưng
│   ├── 📄 product-grid.tsx         # Grid layout
│   ├── 📄 shop-filters.tsx         # Bộ lọc tìm kiếm
│   ├── 📄 cart-provider.tsx        # Cart context
│   ├── 📄 hero-slider.tsx          # Banner slider
│   ├── 📄 add-to-cart-button.tsx   # Nút thêm vào giỏ
│   ├── 📄 wishlist-button.tsx      # Nút yêu thích
│   ├── 📄 related-products.tsx     # Thú cưng liên quan
│   └── 📂 ui/                      # Shadcn/UI components
│       ├── 📄 button.tsx
│       ├── 📄 card.tsx
│       ├── 📄 dialog.tsx
│       ├── 📄 input.tsx
│       ├── 📄 select.tsx
│       └── ... (40+ components)
│
├── 📂 lib/                          # Utilities & Helpers
│   ├── 📄 utils.ts                 # Utility functions
│   ├── 📄 types.ts                 # TypeScript types
│   └── 📄 products.ts              # Product data & logic
│
├── 📂 hooks/                        # Custom React Hooks
│   ├── 📄 use-mobile.tsx           # Mobile detection
│   └── 📄 use-toast.ts             # Toast notifications
│
├── 📂 public/                       # Static Assets
│   ├── 🖼️ placeholder-logo.svg
│   ├── 🖼️ placeholder.jpg
│   └── 🖼️ placeholder-user.jpg
│
├── 📂 styles/                       # Additional Styles
│   └── 📄 globals.css
│
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 tailwind.config.ts            # Tailwind config
├── 📄 next.config.mjs               # Next.js config
├── 📄 postcss.config.mjs            # PostCSS config
├── 📄 components.json               # Shadcn/UI config
└── 📄 README.md                     # Documentation (file này)
```

---

## 🎨 Screenshots

### Trang Chủ
*Hiển thị banner, danh sách thú cưng nổi bật, dịch vụ*

### Tìm Kiếm & Lọc
*Tìm kiếm thú cưng theo nhiều tiêu chí*

### Chi Tiết Thú Cưng
*Thông tin đầy đủ về thú cưng, ảnh, đặc điểm, liên hệ*

### Trang Cá Nhân
*Quản lý hồ sơ, thú cưng của bạn, giao dịch*

---

## 🔧 Tùy Chỉnh

### Thay Đổi Theme

Chỉnh sửa file `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
    },
  },
}
```

## 📦 Deployment

### Vercel (Khuyến nghị)

1. Push code lên GitHub/GitLab
2. Truy cập [Vercel](https://vercel.com)
3. Import repository
4. Vercel tự động deploy

### Netlify

```bash
npm run build
# Upload folder .next lên Netlify
```

### Docker

```dockerfile
# Dockerfile mẫu
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh mọi đóng góp! Hãy làm theo các bước sau:

1. **Fork** repository này
2. **Tạo branch** mới (`git checkout -b feature/TenTinhNang`)
3. **Commit** thay đổi (`git commit -m 'Thêm tính năng ABC'`)
4. **Push** lên branch (`git push origin feature/TenTinhNang`)
5. Tạo **Pull Request**

### Coding Guidelines

- Sử dụng TypeScript cho type safety
- Tuân thủ ESLint rules
- Viết code dễ đọc, có comment khi cần
- Test kỹ trước khi commit

---

## 📝 Roadmap

### Version 1.0 (Hiện tại)
- [x] Giao diện cơ bản
- [x] Tìm kiếm & lọc thú cưng
- [x] Giỏ hàng & Wishlist
- [x] Responsive design

### Version 1.5 (Q1 2025)
- [ ] Hệ thống đăng ký/đăng nhập
- [ ] Chat real-time
- [ ] Tích hợp payment gateway
- [ ] Đánh giá & review

### Version 2.0 (Q2 2025)
- [ ] Mobile app (React Native)
- [ ] AI gợi ý thú cưng phù hợp
- [ ] Tích hợp bản đồ Google Maps
- [ ] Hệ thống thông báo push
- [ ] Video call tư vấn với bác sĩ thú y

---

## 🐛 Bug Reports & Feature Requests

Nếu bạn phát hiện lỗi hoặc có ý tưởng tính năng mới:

1. Kiểm tra [Issues](https://github.com/yourusername/pet-connect/issues) xem đã có người báo cáo chưa
2. Nếu chưa, tạo issue mới với mô tả chi tiết
3. Sử dụng labels phù hợp (bug, enhancement, question)

---

## 📄 License

Dự án này được cấp phép theo [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Pet Connect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 Team

Được phát triển bởi **Codescandy Team** và cộng đồng đóng góp.

---

## 📞 Liên Hệ

- **Website**: [https://pet-connect.com](https://pet-connect.com)
- **Email**: support@pet-connect.com
- **Facebook**: [fb.com/petconnect](https://facebook.com/petconnect)
- **Hotline**: 1900-xxxx

---

## 🙏 Cảm Ơn

Cảm ơn các dự án open-source tuyệt vời:

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

<div align="center">

**🐾 Pet Connect - Kết nối yêu thương, lan tòa nhân ái 🐾**

Made with ❤️ for pets and their humans

[⬆ Về đầu trang](#-pet-connect---cộng-đồng-hỗ-trợ-nhận-nuôi-thú-cưng)

</div>

