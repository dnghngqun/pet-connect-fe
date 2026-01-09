"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Menu, 
  X, 
  User, 
  PawPrint, 
  MapPin, 
  Home,
  Building2,
  Info,
  Phone,
  Sparkles,
  Flag,
  Plus,
  ArrowRight,
  Users,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import UserDropdown from "@/components/user-dropdown"
import NotificationCenter from "@/components/notification-center"
import SearchDropdown from "@/components/search-dropdown"
import PostDetailModal from "@/components/post-detail-modal"
import authService from "@/services/authService"
import userService from "@/services/userService"
import type { PetPost } from "@/lib/types"

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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    const timer = setTimeout(async () => {
      try {
        const allResults: any[] = []
        
        // Search users
        try {
          const userResponse = await userService.searchUsers(searchQuery)
          if (userResponse.success && userResponse.data) {
            const userResults = userResponse.data.map((user: any) => ({
              type: 'user' as const,
              id: user.userId || user.id,
              title: user.fullName || user.userName,
              subtitle: user.bio || user.email,
              avatar: user.avatarUrl,
            }))
            allResults.push(...userResults)
          }
        } catch (err) {
          console.error('User search error:', err)
        }

        // Search posts
        try {
          const postResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/posts?q=${encodeURIComponent(searchQuery)}`)
          if (postResponse.ok) {
            const postData = await postResponse.json()
            if (postData.success && postData.data) {
              const postResults = (postData.data.posts || postData.data.content)?.map((post: any) => ({
                type: 'post' as const,
                id: post.id,
                title: post.title || 'Bài viết',
                subtitle: post.description || post.content?.substring(0, 100) || '',
                avatar: post.image || post.images?.[0]
              })) || []
              allResults.push(...postResults)
            }
          }
        } catch (err) {
          console.error('Post search error:', err)
        }

        setSearchResults(allResults)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const navLinks = [
    { href: "/", icon: <Home className="h-4 w-4" />, label: "Trang chủ" },
    { href: "/groups", icon: <Users className="h-4 w-4" />, label: "Hội nhóm" },
    { href: "/friends", icon: <UserPlus className="h-4 w-4" />, label: "Bạn bè" },
    { href: "/chat", icon: <span className="text-lg">💬</span>, label: "Tin nhắn" },
  ]

  const handleSearchResultSelect = (result: any) => {
    if (result.type === 'post') {
      const post: PetPost = {
        id: result.id.toString(),
        title: result.title,
        slug: result.slug || result.id.toString(),
        description: result.subtitle || '',
        image: result.avatar || '',
        petType: 'Unknown',
        status: 'general',
        location: '',
        postedBy: {
          id: '0',
          name: 'Unknown', 
          phone: '',
          avatar: ''
        },
        createdAt: new Date().toISOString(),
        views: 0,
        commentCount: 0,
      }
      setSelectedPost(post)
      setIsPostModalOpen(true)
    } else if (result.type === 'user') {
      router.push(`/profile/${result.id}`)
    } else if (result.type === 'group') {
      router.push(`/groups/${result.slug || result.id}`)
    }
    
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

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

        {/* Desktop Navigation - Hidden when search is open */}
        <nav className={cn(
          "hidden lg:flex items-center gap-1 mx-4 transition-all duration-300",
          isSearchOpen && "opacity-0 pointer-events-none w-0 overflow-hidden"
        )}>
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

        {/* Search - Expands to cover nav when open */}
        <div className={cn(
          "transition-all duration-300 ease-out",
          isSearchOpen ? "flex-1" : "w-0 overflow-hidden"
        )}>
          {isSearchOpen && (
            <div className="relative w-full animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full blur-xl" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Tìm kiếm người dùng, bài viết..." 
                  className="w-full pl-10 pr-10 rounded-full border-primary/20 focus:border-primary bg-background/80 backdrop-blur"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <SearchDropdown
                  results={searchResults}
                  loading={searchLoading}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  onSelect={handleSearchResultSelect}
                />
              )}
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

          {!isLoading && (
            <>
              {isLoggedIn ? (
                <>
                  <NotificationCenter />
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex hover:bg-primary/10">
                    <Link href="/sign-in">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild className="hidden sm:flex bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0">
                    <Link href="/sign-up">Đăng ký</Link>
                  </Button>
                </>
              )}
            </>
          )}
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
      {/* Modal for Post Details */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          open={isPostModalOpen}
          onOpenChange={setIsPostModalOpen}
        />
      )}
    </header>
  )
}
