'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import authService from '@/services/authService';
import { useState, useEffect } from 'react';
import { useSseNotifications } from '@/hooks/useSseNotifications';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPet, setCurrentPet] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // SSE Notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSseNotifications();

  useEffect(() => {
    // Load current pet from localStorage
    if (typeof window !== 'undefined') {
      const storedPet = localStorage.getItem('current-pet');
      if (storedPet) {
        setCurrentPet(JSON.parse(storedPet));
      }
      
      // Listen for pet updates
      const handleStorageChange = () => {
         const updatedPet = localStorage.getItem('current-pet');
         if (updatedPet) {
           setCurrentPet(JSON.parse(updatedPet));
         }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/sign-in');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const linkClass = (path: string) => `
    font-medium text-sm transition-colors relative
    ${isActive(path) 
      ? 'text-[#f06e42] font-bold' 
      : 'text-[#1b110d] dark:text-gray-300 hover:text-[#f06e42]'}
  `;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#19191f]/90 backdrop-blur-md border-b border-[#f3eae7] dark:border-gray-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0 cursor-pointer group">
            <div className="size-8 text-[#f06e42] transition-transform group-hover:rotate-12">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight hidden md:block text-[#1b110d] dark:text-white">Pet-Connect</h1>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className={linkClass('/')}>
              Trang chủ
              {isActive('/') && <span className="absolute -bottom-6 left-0 w-full h-1 bg-[#f06e42] rounded-t-full"></span>}
            </Link>
            <Link href="/groups" className={linkClass('/groups')}>
              Nhóm & Sự kiện
              {isActive('/groups') && <span className="absolute -bottom-6 left-0 w-full h-1 bg-[#f06e42] rounded-t-full"></span>}
            </Link>
            <Link href="/messages" className={linkClass('/messages')}>
              Tin nhắn
              {isActive('/messages') && <span className="absolute -bottom-6 left-0 w-full h-1 bg-[#f06e42] rounded-t-full"></span>}
            </Link>
          </nav>

          <div className="flex items-center gap-4 flex-1 justify-end max-w-md">
            <div className="relative w-full max-w-[240px] hidden sm:block group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9a5f4c]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input 
                className="block w-full rounded-full border-none bg-[#f3eae7] dark:bg-white/5 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#f06e42]/50 transition-all placeholder-[#9a5f4c] text-[#1b110d] dark:text-white"
                placeholder="Tìm kiếm..." 
                type="text"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
               {/* Mobile Search */}
               <button className="sm:hidden p-2 text-[#1b110d] dark:text-white">
                  <span className="material-symbols-outlined text-[24px]">search</span>
               </button>
               
               {/* Notifications Bell */}
               <div className="relative">
                 <button 
                   onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                   className="p-2 text-[#1b110d] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
                 >
                   <span className="material-symbols-outlined text-[24px]">notifications</span>
                   {unreadCount > 0 && (
                     <span className="absolute -top-0.5 -right-0.5 size-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                       {unreadCount > 9 ? '9+' : unreadCount}
                     </span>
                   )}
                 </button>
                 
                 {/* Notifications Dropdown */}
                 {isNotificationsOpen && (
                   <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#232329] rounded-xl shadow-lg border border-gray-100 dark:border-white/5 py-1 z-50 animate-fade-in-up max-h-96 overflow-y-auto">
                     <div className="flex items-center justify-between px-4 py-2 border-b dark:border-white/5">
                       <span className="font-bold text-[#1b110d] dark:text-white">Thông báo</span>
                       {unreadCount > 0 && (
                         <button 
                           onClick={markAllAsRead} 
                           className="text-xs text-[#f06e42] hover:underline"
                         >
                           Đánh dấu tất cả đã đọc
                         </button>
                       )}
                     </div>
                     {notifications.length === 0 ? (
                       <div className="px-4 py-8 text-center text-gray-500">
                         <span className="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
                         <p className="text-sm">Chưa có thông báo</p>
                       </div>
                     ) : (
                       notifications.slice(0, 10).map(notification => (
                         <div 
                           key={notification.id}
                           onClick={() => {
                             markAsRead(notification.id);
                             if (notification.link) {
                               router.push(notification.link);
                             }
                             setIsNotificationsOpen(false);
                           }}
                           className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                             !notification.isRead ? 'bg-[#f06e42]/5' : ''
                           }`}
                         >
                           <div className="flex gap-3">
                             {notification.fromUserAvatar && (
                               <img 
                                 src={notification.fromUserAvatar} 
                                 alt="" 
                                 className="size-10 rounded-full object-cover"
                               />
                             )}
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-[#1b110d] dark:text-white truncate">
                                 {notification.title}
                               </p>
                               <p className="text-xs text-gray-500 truncate">
                                 {notification.content}
                               </p>
                               <p className="text-xs text-gray-400 mt-1">
                                 {new Date(notification.createdAt).toLocaleTimeString('vi-VN', {
                                   hour: '2-digit',
                                   minute: '2-digit'
                                 })}
                               </p>
                             </div>
                             {!notification.isRead && (
                               <span className="size-2 bg-[#f06e42] rounded-full mt-2"></span>
                             )}
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 )}
               </div>
               
               {/* User/Pet Avatar */}
               {currentPet ? (
                  <div className="relative">
                    <div 
                      className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-white dark:border-[#19191f] shadow-sm cursor-pointer shrink-0"
                      style={{
                        backgroundImage: currentPet.profilePhoto
                          ? `url('${currentPet.profilePhoto}')`
                          : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
                      }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      title="Menu cá nhân"
                    />
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#232329] rounded-xl shadow-lg border border-gray-100 dark:border-white/5 py-1 z-50 animate-fade-in-up">
                        <Link 
                          href={currentPet ? `/pets/${currentPet.id}/profile` : "/profile"} 
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b110d] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px]">person</span>
                          Trang cá nhân
                        </Link>
                        <Link 
                          href="/calendar" 
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b110d] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                          Lịch hoạt động
                        </Link>
                        <Link 
                          href="/medical-records" 
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b110d] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px]">medical_services</span>
                          Hồ sơ y tế
                        </Link>
                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                        <button
                          onClick={() => {
                            localStorage.removeItem('selected-pet-id');
                            localStorage.removeItem('current-pet');
                            router.push('/select-pet');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
                          Thoát thú cưng
                        </button>
                      </div>
                    )}
                  </div>
               ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-lg size-9 bg-gray-100 dark:bg-gray-800 text-[#1b110d] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </button>
               )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </header>
  );
}
