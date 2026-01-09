'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Bell, 
  Search,
  Menu,
  X,
  PawPrint,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import authService from '@/services/authService';
import SearchBar from '@/components/search/search-bar';
import NotificationCenter from '@/components/notification-center';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/groups', icon: Users, label: 'Nhóm' },
  { href: '/messages', icon: MessageCircle, label: 'Tin nhắn' },
];

export default function FacebookNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(!!user);
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/sign-in');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          
          <div className="flex items-center gap-2 flex-1">
            
            <Link href="/" className="flex items-center gap-2 mr-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="hidden md:block font-bold text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                PetConnect
              </span>
            </Link>

            
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar />
            </div>
          </div>

          
          <div className="hidden md:flex items-center gap-1 mx-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center justify-center px-8 py-2 rounded-lg transition-all',
                    'hover:bg-muted/50',
                    active && 'text-primary'
                  )}
                  title={item.label}
                >
                  <Icon className={cn('h-6 w-6', active && 'stroke-[2.5]')} />
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
                  )}
                </Link>
              );
            })}
          </div>

          
          <div className="flex items-center gap-2">
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {isLoggedIn ? (
              <>
                
                <NotificationCenter />

                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback>
                          {currentUser?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback>
                          {currentUser?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{currentUser?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/profile/${currentUser?.id}`)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Trang cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push('/sign-in')}>
                  Đăng nhập
                </Button>
                <Button onClick={() => router.push('/sign-up')}>
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>

        
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            
            <div className="mb-4">
              <SearchBar />
            </div>

            
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      'hover:bg-muted/50',
                      active && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
