"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, User, PawPrint, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl">PetConnect</span>
          </Link>
        </div>

        <nav className="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Trang chủ
          </Link>
          <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
            Danh sách bài đăng
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            Giới thiệu
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Liên hệ
          </Link>
        </nav>

        <div className={cn("transition-all duration-200 ease-in-out", isSearchOpen ? "flex-1" : "w-0 overflow-hidden")}>
          {isSearchOpen && (
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Tìm kiếm bài đăng..." className="w-full pl-8 rounded-full" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Đóng tìm kiếm</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {!isSearchOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>
          )}

          <Link href="/post/new">
            <Button variant="default" size="sm" className="hidden md:flex">
              <Plus className="h-4 w-4 mr-2" />
              Đăng bài
            </Button>
          </Link>

          <div className="hidden md:flex">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="mr-1">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="default" size="sm">
                Đăng ký
              </Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Link href="/sign-in">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Tài khoản</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <nav className="container grid gap-6 p-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Danh sách bài đăng
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Giới thiệu
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Liên hệ
            </Link>
            <Link
              href="/post/new"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="h-5 w-5" />
              Đăng bài
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
