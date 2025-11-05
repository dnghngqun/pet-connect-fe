"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, PawPrint } from "lucide-react"

export default function Footer() {
  const [year, setYear] = useState<number>()

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  return (
    <footer className="bg-muted">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">PetConnect</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Mạng xã hội kết nối cộng đồng cứu hộ động vật, giúp tìm thú cưng thất lạc và tìm nhà cho những bé cần nhận nuôi.
            </p>
            <div className="flex mt-6 space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Danh sách</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/shop?status=lost" className="text-sm text-muted-foreground hover:text-primary">
                  Thú cưng thất lạc
                </Link>
              </li>
              <li>
                <Link href="/shop?status=found" className="text-sm text-muted-foreground hover:text-primary">
                  Thú cưng tìm thấy
                </Link>
              </li>
              <li>
                <Link href="/shop?status=for-adoption" className="text-sm text-muted-foreground hover:text-primary">
                  Cần nhà
                </Link>
              </li>
              <li>
                <Link href="/shop?status=rescue" className="text-sm text-muted-foreground hover:text-primary">
                  Cứu hộ động vật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Công ty</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/post/new" className="text-sm text-muted-foreground hover:text-primary">
                  Đăng bài mới
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Hỗ trợ</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Liên hệ hỗ trợ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Điều khoản & Điều kiện
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t">
            <p className="text-xs text-muted-foreground">
            &copy; {year ?? "—"} PetConnect. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}
