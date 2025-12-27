"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Menu, 
  X, 
  User, 
  PawPrint, 
  Plus, 
  MapPin, 
  Flag,
  Home,
  LayoutGrid,
  Heart,
  Building2,
  Info,
  Phone,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import UserDropdown from "@/components/user-dropdown"
import NotificationCenter from "@/components/notification-center"
import authService from "@/services/authService"

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick?: () => void
}

const NavLink = ({ href, icon, label, isActive, onClick }: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all duration-300",
      "hover:bg-primary/10 hover:text-primary",
      "group",
      isActive 
        ? "text-primary bg-primary/10" 
        : "text-muted-foreground"
    )}
  >
    <span className={cn(
      "transition-transform duration-300 group-hover:scale-110",
      isActive && "text-primary"
    )}>
      {icon}
    </span>
    <span>{label}</span>
    {isActive && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
    )}
  </Link>
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const user = authService.getCurrentUser()
    setIsLoggedIn(!!user)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: "/", icon: <Home className="h-4 w-4" />, label: "Trang chủ" },
    { href: "/shop", icon: <LayoutGrid className="h-4 w-4" />, label: "Bài đăng" },
    { href: "/nearby", icon: <MapPin className="h-4 w-4" />, label: "Gần bạn" },
    { href: "/fundraising", icon: <Heart className="h-4 w-4" />, label: "Gây quỹ" },
    { href: "/rescue-centers", icon: <Building2 className="h-4 w-4" />, label: "Cứu hộ" },
  ]

  const moreLinks = [
    { href: "/about", icon: <Info className="h-4 w-4" />, label: "Giới thiệu" },
    { href: "/contact", icon: <Phone className="h-4 w-4" />, label: "Liên hệ" },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b" 
        : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-primary/10"
          >
            <div className="relative w-6 h-6">
              <span className={cn(
                "absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300",
                isMenuOpen && "rotate-45 translate-y-2"
              )} />
              <span className={cn(
                "absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300",
                isMenuOpen && "opacity-0"
              )} />
              <span className={cn(
                "absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300",
                isMenuOpen && "-rotate-45 -translate-y-2"
              )} />
            </div>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-orange-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <div className="relative bg-gradient-to-br from-primary to-orange-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            PetConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}
          {!isLoading && isLoggedIn && (
            <NavLink
              href="/organization-reports"
              icon={<Flag className="h-4 w-4" />}
              label="Báo cáo"
              isActive={pathname === "/organization-reports"}
            />
          )}
          {/* More dropdown could be added here for About/Contact */}
        </nav>

        {/* Search */}
        <div className={cn(
          "transition-all duration-300 ease-out",
          isSearchOpen ? "flex-1 max-w-md" : "w-0 overflow-hidden"
        )}>
          {isSearchOpen && (
            <div className="relative w-full animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full blur-xl" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Tìm kiếm thú cưng..." 
                  className="w-full pl-10 pr-10 rounded-full border-primary/20 focus:border-primary bg-background/80 backdrop-blur"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {!isSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          <Link href="/nearby" className="hidden sm:flex">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10 hover:text-primary transition-colors relative group"
            >
              <MapPin className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </Button>
          </Link>

          {!isLoading && isLoggedIn && (
            <NotificationCenter userId={authService.getCurrentUser()?.id} />
          )}

          {/* Post Button */}
          <Link href="/post/new" className="hidden md:flex">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group"
            >
              <Sparkles className="h-4 w-4 mr-1.5 group-hover:animate-pulse" />
              Đăng bài
              <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Button>
          </Link>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {!isLoading && !isLoggedIn ? (
              <>
                <Link href="/sign-in">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-white"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            ) : !isLoading ? (
              <UserDropdown />
            ) : null}
          </div>

          {/* Mobile User */}
          <div className="md:hidden">
            {!isLoading && !isLoggedIn ? (
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-primary/10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : !isLoading ? (
              <UserDropdown />
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-x-0 top-16 z-50 bg-background/95 backdrop-blur-xl lg:hidden transition-all duration-300 ease-out border-b shadow-xl",
        isMenuOpen 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}>
        <nav className="container py-4 space-y-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                "hover:bg-primary/10 hover:pl-6",
                pathname === link.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className={cn(
                "p-2 rounded-lg",
                pathname === link.href ? "bg-primary/20" : "bg-muted"
              )}>
                {link.icon}
              </span>
              <span>{link.label}</span>
              {pathname === link.href && (
                <ArrowRight className="h-4 w-4 ml-auto" />
              )}
            </Link>
          ))}
          
          {isLoggedIn && (
            <Link
              href="/organization-reports"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                "hover:bg-primary/10 hover:pl-6",
                pathname === "/organization-reports" 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="p-2 rounded-lg bg-muted">
                <Flag className="h-4 w-4" />
              </span>
              <span>Báo cáo tổ chức</span>
            </Link>
          )}

          <div className="pt-4 px-4 border-t mt-4">
            <Link href="/post/new" onClick={() => setIsMenuOpen(false)}>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-orange-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Đăng bài mới
              </Button>
            </Link>
          </div>

          {!isLoggedIn && (
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/sign-in" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/sign-up" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-primary to-orange-500 text-white">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}
