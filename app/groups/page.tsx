"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import groupService, { Group } from "@/services/groupService";
import eventService, { Event as BackendEvent } from "@/services/eventService";
import petService, { Pet } from "@/services/petService";
import { useAuth } from "@/hooks/useAuth";
import CreateGroupModal from "@/components/groups/create-group-modal";
import CreateEventModal from "@/components/events/create-event-modal";
import { toast } from 'react-hot-toast';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function GroupsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [showAllGroupsPopup, setShowAllGroupsPopup] = useState(false);
  const [loadingAllGroups, setLoadingAllGroups] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  useEffect(() => {
    const storedPet = localStorage.getItem('current-pet');
    if (storedPet) {
      setCurrentPet(JSON.parse(storedPet));
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (user) {
      fetchMyPets();
    }
  }, [user, currentPet?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Groups (limit to 5 for carousel)
      const groupsData = await groupService.getGroups({ size: 5, petId: currentPet?.id });
      if (groupsData && groupsData.data) {
        setGroups(groupsData.data);
      }

      // Fetch Events
      const eventsData = await eventService.getUpcomingEvents(0, 5, currentPet?.id);
      if (eventsData && eventsData.content) {
        setEvents(eventsData.content);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    setLoadingAllGroups(true);
    try {
      const groupsData = await groupService.getGroups({ size: 50, petId: currentPet?.id });
      if (groupsData && groupsData.data) {
        setAllGroups(groupsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch all groups", error);
    } finally {
      setLoadingAllGroups(false);
    }
  };

  const handleOpenAllGroups = () => {
    setShowAllGroupsPopup(true);
    if (allGroups.length === 0) {
      fetchAllGroups();
    }
  };

  const fetchMyPets = async () => {
    const res = await petService.getMyPets();
    if (res.success) {
      setMyPets(res.data);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tham gia nhóm");
      return;
    }
    if (!currentPet) {
      toast.error("Vui lòng chọn thú cưng để tham gia nhóm");
      return;
    }
    try {
      await groupService.joinGroup(groupId, currentPet.id);
      toast.success("Đã gửi yêu cầu tham gia nhóm!");
      fetchData();
      if (showAllGroupsPopup) fetchAllGroups();
    } catch (error) {
      console.error("Join group failed", error);
      toast.error("Không thể tham gia nhóm");
    }
  };

  const handleJoinEvent = async (eventId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tham gia sự kiện");
      return;
    }
    if (myPets.length === 0) {
      toast.error("Bạn cần tạo hồ sơ thú cưng trước khi tham gia sự kiện!");
      return;
    }
    
    const defaultPet = myPets[0];
    
    try {
      const res = await eventService.joinEvent(eventId, defaultPet.id);
      if (res.success) {
        toast.success(`Đã đăng ký cho ${defaultPet.name} tham gia sự kiện thành công!`);
        fetchData();
      } else {
        toast.error(res.message || "Không thể tham gia sự kiện");
      }
    } catch (error) {
        console.error("Join event failed", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        month: `Tháng ${date.getMonth() + 1}`,
        day: date.getDate()
    };
  };

  // Group Card Component
  const GroupCard = ({ group, compact = false }: { group: Group; compact?: boolean }) => (
    <div className={`bg-white dark:bg-[#3c3632] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full border border-transparent hover:border-[#ff7366]/20 ${compact ? 'min-w-[280px]' : ''}`}>
      <div className="h-36 bg-cover bg-center relative" style={{ backgroundImage: `url('${group.coverImageUrl || "https://images.unsplash.com/photo-1599141022634-11818274718c?w=500"}')` }}>
        {group.memberRole && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#1d0e0c] dark:text-white shadow-sm">
            {group.memberRole}
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/groups/${group.slug}`}>
          <h3 className="text-base font-bold text-[#1d0e0c] dark:text-white mb-1 group-hover:text-[#ff7366] transition-colors line-clamp-1">{group.name}</h3>
        </Link>
        <p className="text-[#6b5e5c] dark:text-gray-400 text-sm mb-3 line-clamp-2">{group.description || "Không có mô tả"}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6b5e5c]">
            <span className="material-symbols-outlined text-[16px]">group</span>
            {group.memberCount} thành viên
          </div>
          {group.isMember ? (
            <button className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg cursor-default">
              Đã tham gia
            </button>
          ) : (
            <button 
              onClick={(e) => { e.preventDefault(); handleJoinGroup(group.id); }}
              className="text-xs font-bold text-[#ff7366] bg-[#ff7366]/10 hover:bg-[#ff7366] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
              Tham gia
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d0e0c] dark:text-white tracking-tight">
          Tìm Kiếm <span className="text-[#ff7366]">Bầy Đàn</span>
        </h1>
        <p className="text-lg text-[#6b5e5c] dark:text-gray-400 max-w-xl">
          Khám phá các cộng đồng thú cưng địa phương, tham gia các buổi gặp gỡ theo giống loài, và không bao giờ bỏ lỡ sự kiện thú vị nào.
        </p>
        <div className="w-full relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#ff7366]">search</span>
          </div>
          <input
            className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-[#3c3632] border-2 border-transparent focus:border-[#ff7366]/30 focus:ring-0 focus:outline-none shadow-lg shadow-[#ff7366]/5 text-lg text-[#1d0e0c] dark:text-white placeholder:text-gray-400 transition-all"
            placeholder="Tìm kiếm giống loài, địa điểm hoặc tên nhóm..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3 w-full">
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-100 dark:border-gray-700 hover:border-[#ff7366]/50 hover:bg-[#ff7366]/5 text-sm font-semibold text-[#1d0e0c] dark:text-white shadow-sm transition-all flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[#26BFBA] text-[20px] group-hover:scale-110 transition-transform">location_on</span>
            Gần tôi
          </button>
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-100 dark:border-gray-700 hover:border-[#ff7366]/50 hover:bg-[#ff7366]/5 text-sm font-semibold text-[#1d0e0c] dark:text-white shadow-sm transition-all flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[#26BFBA] text-[20px] group-hover:scale-110 transition-transform">pets</span>
            Theo giống loài
          </button>
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-[#3c3632] border border-gray-100 dark:border-gray-700 hover:border-[#ff7366]/50 hover:bg-[#ff7366]/5 text-sm font-semibold text-[#1d0e0c] dark:text-white shadow-sm transition-all flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[#26BFBA] text-[20px] group-hover:scale-110 transition-transform">calendar_month</span>
            Cuối tuần này
          </button>
        </div>
      </section>

      {/* Groups Carousel Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-bold text-[#1d0e0c] dark:text-white">Nhóm gợi ý</h2>
          <button 
            onClick={handleOpenAllGroups}
            className="text-[#ff7366] font-semibold hover:underline flex items-center gap-1 text-sm"
          >
            Xem tất cả <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Chưa có nhóm nào.</div>
        ) : (
          <div className="relative group/swiper">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl: '.swiper-button-prev-custom',
                nextEl: '.swiper-button-next-custom',
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="pb-10"
            >
              {groups.map((group) => (
                <SwiperSlide key={group.id}>
                  <GroupCard group={group} />
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white dark:bg-[#3c3632] rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:bg-[#ff7366] hover:text-white">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white dark:bg-[#3c3632] rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:bg-[#ff7366] hover:text-white">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>

      {/* Events Section */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-bold text-[#1d0e0c] dark:text-white">Sự kiện sắp tới</h2>
          <a className="text-[#ff7366] font-semibold hover:underline flex items-center gap-1 text-sm" href="#">
            Xem lịch <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          </a>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const { month, day } = formatDate(event.startAt);
            return (
              <div key={event.id} className="bg-white dark:bg-[#3c3632] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#ff7366]/20">
                <div className="shrink-0 flex sm:flex-col items-center justify-center gap-1 bg-[#ff7366]/5 dark:bg-[#ff7366]/10 text-[#ff7366] w-full sm:w-20 h-14 sm:h-20 rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider">{month}</span>
                  <span className="text-2xl font-extrabold leading-none">{day}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <Link href={`/events/${event.id}`} className="hover:text-[#ff7366] transition-colors block">
                    <h3 className="text-lg font-bold text-[#1d0e0c] dark:text-white mb-1">{event.title}</h3>
                  </Link>
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-[#6b5e5c] dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#26BFBA] text-[18px]">location_on</span>
                      {event.location}
                    </span>
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#26BFBA] text-[18px]">group</span>
                      {event.participantCount} thú cưng tham gia
                    </span>
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  {event.isParticipating ? (
                    <button className="w-full sm:w-auto px-6 py-3 bg-green-100 text-green-600 font-bold rounded-xl shadow-sm cursor-default flex items-center justify-center gap-2">
                      Đã tham gia
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoinEvent(event.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-[#ff7366] hover:bg-[#ff7366]/90 text-white font-bold rounded-xl shadow-sm shadow-[#ff7366]/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                      Tham gia sự kiện
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {events.length === 0 && <div className="text-center text-gray-500">Chưa có sự kiện nào sắp tới.</div>}
        </div>
        )}
      </section>
        
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-8 z-40 flex flex-col items-start gap-3">
        <button 
          onClick={() => setShowCreateGroupModal(true)}
          className="flex items-center gap-2 bg-[#ff7366] hover:bg-[#ff7366]/90 text-white px-5 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">group_add</span>
          <span className="font-bold hidden sm:inline">Tạo nhóm</span>
        </button>
        <button 
          onClick={() => setShowCreateEventModal(true)}
          className="flex items-center gap-2 bg-[#1d0e0c] hover:bg-[#1d0e0c]/90 text-white px-5 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="font-bold hidden sm:inline">Tạo sự kiện</span>
        </button>
      </div>

      {/* All Groups Popup */}
      {showAllGroupsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAllGroupsPopup(false)}>
          <div 
            className="bg-white dark:bg-[#2c2622] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-[#1d0e0c] dark:text-white">Tất cả nhóm</h2>
              <button 
                onClick={() => setShowAllGroupsPopup(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAllGroups ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                  {allGroups.length === 0 && (
                    <div className="col-span-3 text-center text-gray-500 py-10">Chưa có nhóm nào.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #ff7366;
        }
        .swiper-pagination-bullet-active {
          background: #ff7366;
        }
        .swiper-button-prev, .swiper-button-next {
          display: none;
        }
      `}</style>

      {/* Modals */}
      <CreateGroupModal 
        isOpen={showCreateGroupModal} 
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={() => {
          fetchData();
          if (showAllGroupsPopup) fetchAllGroups();
        }}
      />
      <CreateEventModal 
        isOpen={showCreateEventModal} 
        onClose={() => setShowCreateEventModal(false)}
        onEventCreated={fetchData}
      />
    </main>
  );
}
