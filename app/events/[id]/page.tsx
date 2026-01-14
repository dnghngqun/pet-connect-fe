"use client"

import { SetStateAction, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { eventService, Event, Comment } from "@/services/eventService"
import petService from "@/services/petService"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import activityService, { ActivityType } from "@/services/activityService"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [pets, setPets] = useState<any[]>([])
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)
  const [joining, setJoining] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = async (parentId: number) => {
      if (!replyContent.trim()) return;
      if (!user) {
          toast.error("Vui lòng đăng nhập");
          return;
      }
      if (!selectedPetId) {
          toast.error("Vui lòng chọn thú cưng");
          return;
      }

      try {
        await eventService.addComment(Number(params.id), {
          content: replyContent,
          petId: selectedPetId,
          parentCommentId: parentId
        })
        setReplyContent("")
        setReplyingTo(null)
        fetchComments()
        toast.success("Đã trả lời");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể trả lời");
      }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
        toast.error("Vui lòng đăng nhập để thích bình luận");
        return;
    }
    
    // Optimistic update
    setComments(prev => toggleLikeInTree(prev, commentId));

    try {
        await eventService.toggleLike(commentId);
    } catch (error) {
        console.error("Like failed", error);
        toast.error("Không thể thích bình luận");
        fetchComments(); // Revert
    }
  }
  
  useEffect(() => {
    if (params.id) {
      fetchComments()
      if (user) {
        fetchMyPets()
      }
    }
  }, [params.id, user])

  // Refetch event when pet is selected
  useEffect(() => {
    if (params.id) {
      fetchEventData()
    }
  }, [params.id, selectedPetId])

  const fetchEventData = async () => {
    try {
      const data = await eventService.getEventById(Number(params.id), selectedPetId || undefined)
      console.log('Fetched Event Data:', { 
        id: data.id, 
        isParticipating: data.isParticipating, 
        selectedPetId,
        participantCount: data.participantCount
      })
      setEvent(data)
    } catch (error) {
        // Simple error handling
        console.error("Failed to load event", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const data = await eventService.getComments(Number(params.id))
      setComments(data.content)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const fetchMyPets = async () => {
    try {
      const response = await petService.getMyPets()
      if (response.success && Array.isArray(response.data)) {
        setPets(response.data)
        
        // Priority: LocalStorage > First Pet in list
        let found = false;
        const storedPetStr = localStorage.getItem('currentPet');
        
        if (storedPetStr) {
            try {
                const storedPet = JSON.parse(storedPetStr);
                // Verify the stored pet is in the user's list (validity check)
                if (response.data.find((p: any) => p.id === storedPet.id)) {
                    setSelectedPetId(storedPet.id);
                    found = true;
                }
            } catch (e) {}
        }
        
        if (!found && response.data.length > 0) {
          setSelectedPetId(response.data[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching pets:", error)
    }
  }

  const handleJoinEvent = async () => {
    if (!user) {
        toast.error("Vui lòng đăng nhập để tham gia sự kiện");
        window.location.href = '/sign-in';
        return;
    }
    if (!selectedPetId) {
      toast.error("Vui lòng chọn thú cưng");
      return
    }

    setJoining(true)
    try {
      if (event?.isParticipating) {
        await eventService.leaveEvent(Number(params.id), selectedPetId)
        toast.success("Đã rời khỏi sự kiện!");
        if (event) {
             setEvent({
                 ...event,
                 isParticipating: false,
                 participantCount: Math.max(0, event.participantCount - 1)
             })
        }
      } else {
        await eventService.joinEvent(Number(params.id), selectedPetId)
        toast.success("Đã tham gia sự kiện thành công!");
        if (event) {
             setEvent({
                 ...event,
                 isParticipating: true,
                 participantCount: event.participantCount + 1
             })
        }
      }
      // await fetchEventData() - Removed to preserve optimistic update state and avoid stale data overwrite
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setJoining(false)
    }
  }

  const handlePostComment = async () => {
    if (!commentContent.trim()) return
    if (!user) {
        toast.error("Vui lòng đăng nhập để bình luận");
        return;
    }
    if (!selectedPetId) {
        toast.error("Vui lòng chọn thú cưng để bình luận");
        return
    }

    try {
      await eventService.addComment(Number(params.id), {
        content: commentContent,
        petId: selectedPetId
      })
      setCommentContent("")
      fetchComments()
      toast.success("Đã đăng bình luận");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đăng bình luận");
    }
  }

  const handleAddToCalendar = async () => {
    if (!user) {
        toast.error("Vui lòng đăng nhập");
        return;
    }
    if (!selectedPetId) {
        toast.error("Vui lòng chọn thú cưng");
        return;
    }
    if (!event) return;

    try {
        await activityService.createActivity({
            title: `Tham gia sự kiện: ${event.title}`,
            description: `${event.description ? event.description.substring(0, 100) + '...' : ''}\nĐịa điểm: ${event.location}\nThời gian: ${format(new Date(event.startAt), "HH:mm dd/MM/yyyy")}`,
            type: ActivityType.PLAY, // Default as PLAY or similar
            startTime: event.startAt,
            endTime: event.endAt || event.startAt, // fallback if no endAt
            location: event.location,
            petId: selectedPetId,
            hasReminder: true // Default to true for events
        });
        toast.success("Đã thêm vào lịch của Pet!");
    } catch (error) {
        console.error("Failed to add to calendar", error);
        toast.error("Không thể thêm vào lịch");
    }
  }

  const handleDeleteEvent = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác.")) {
        return;
    }
    
    try {
        await eventService.deleteEvent(Number(params.id));
        toast.success("Đã xóa sự kiện thành công");
        window.location.href = '/events';
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể xóa sự kiện");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcf8f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7366] border-t-transparent"></div>
      </div>
    )
  }

  if (!event) return null

  // Participant avatars preview
  const participantAvatars = (event as any).participantAvatars || [];
  const displayAvatars = participantAvatars.slice(0, 5);
  const remainingCount = Math.max(0, event.participantCount - 5);

  return (
    <div className="bg-[#fcf8f8] text-[#1d0e0c] font-display min-h-screen flex flex-col">
        {/* Style injection for layout-specific overrides if needed */}
        <style jsx global>{`
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .filled-icon {
                font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
        `}</style>

        <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#a14d45] mb-6">
                <a href="/" className="hover:text-[#ff7366] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                </a>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <a href="/events" className="hover:text-[#ff7366]">Sự kiện</a>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="font-semibold text-[#1d0e0c] truncate max-w-[200px]">{event.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Content (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Image Card */}
                    <div className="relative group w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-[0_0_0_1px_#f4e7e6,0_8px_24px_-4px_rgba(29,14,12,0.04)]">
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url("${event.coverImageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop'}")` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-3 py-1 bg-[#ff7366] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                    {event.isPrivate ? 'Private' : 'Public'}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/30">
                                    {event.price && event.price > 0 ? `${event.price.toLocaleString()} VND` : 'Miễn phí'}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
                                {event.title}
                            </h1>
                            <p className="text-white/90 font-medium text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ff7366] filled-icon">favorite</span>
                                {event.groupName ? `Tổ chức bởi ${event.groupName}` : 'Sự kiện cộng đồng'}
                            </p>
                        </div>
                        {/* Share Button (Absolute Top Right) */}
                        <button className="absolute top-4 right-4 size-10 bg-white/20 hover:bg-white backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:text-[#ff7366] transition-all shadow-lg">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>

                    {/* Info Section: Description & Attendees */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_0_0_1px_#f4e7e6,0_8px_24px_-4px_rgba(29,14,12,0.04)] border border-[#f4e7e6]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#ff7366]/10 p-2 rounded-lg text-[#ff7366]">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#1d0e0c]">Thông tin chi tiết</h2>
                        </div>
                        <div className="prose prose-p:text-[#1d0e0c]/80 prose-headings:text-[#1d0e0c] max-w-none mb-8 whitespace-pre-line">
                            <p className="leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                        
                        {/* Attendees Strip */}
                        <div className="border-t border-[#f4e7e6] pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-[#1d0e0c] mb-1">Thú cưng tham gia</h3>
                                    <p className="text-sm text-[#a14d45]">
                                        {event.participantCount > 0 ? `Hơn ${event.participantCount} bé đã đăng ký` : 'Chưa có thú cưng tham gia'}
                                    </p>
                                </div>
                                <div className="flex items-center -space-x-3">
                                    {displayAvatars.map((avatar: string, index: number) => (
                                        <div 
                                            key={index} 
                                            className="w-10 h-10 rounded-full border-2 border-white bg-cover bg-center bg-gray-200"
                                            style={{ backgroundImage: `url("${avatar || '/placeholder-pet.jpg'}")` }}
                                        ></div>
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-[#fcf8f8] flex items-center justify-center text-xs font-bold text-[#a14d45]">
                                            +{remainingCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discussion Section */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_0_0_1px_#f4e7e6,0_8px_24px_-4px_rgba(29,14,12,0.04)] border border-[#f4e7e6]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#ff7366]/10 p-2 rounded-lg text-[#ff7366]">
                                    <span className="material-symbols-outlined">forum</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#1d0e0c]">Thảo luận <span className="text-[#a14d45] text-base font-normal">({comments.length})</span></h2>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="flex gap-4 mb-8">
                            <div 
                                className="size-10 rounded-full bg-cover bg-center shrink-0 bg-gray-200" 
                                style={{ backgroundImage: `url("${(selectedPetId && pets.find(p => p.id === selectedPetId)?.profilePhoto) || (selectedPetId ? '/placeholder-pet.jpg' : (user?.avatar || '/placeholder-user.jpg'))}")` }}
                            ></div>
                            <div className="flex-1 relative">
                                <textarea 
                                    className="w-full bg-[#fcf8f8] border-[#eacfcd] rounded-xl p-3 pr-12 focus:ring-[#ff7366] focus:border-[#ff7366] resize-none text-sm placeholder:text-[#a14d45]/60 block focus:outline-none focus:ring-1" 
                                    placeholder="Đặt câu hỏi hoặc chia sẻ cảm nghĩ..." 
                                    rows={2}
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                ></textarea>
                                 <div className="absolute bottom-2 left-2 flex gap-2">
                                     {/* Simple Pet Selector */}
                                    {/* Selected pet indicator removed as requested, using default selectedPetId */}
                                </div>
                                <button 
                                    onClick={handlePostComment}
                                    disabled={!commentContent.trim()}
                                    className="absolute bottom-3 right-3 text-[#ff7366] hover:text-[#e6685c] p-1 rounded-md hover:bg-[#ff7366]/10 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </div>



                        {/* Comment List */}
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <CommentItem 
                                    key={comment.id} 
                                    comment={comment} 
                                    onReply={(id: SetStateAction<number | null>) => setReplyingTo(id)}
                                    replyingToId={replyingTo}
                                    replyContent={replyContent}
                                    setReplyContent={setReplyContent}
                                    onSubmitReply={() => handleReplySubmit(comment.id)}
                                    user={user}
                                    selectedPetId={selectedPetId}
                                    pets={pets}
                                    onLike={handleLikeComment}
                                />
                            ))}
                            {comments.length > 5 && (
                                <button className="w-full mt-6 py-2 text-sm font-semibold text-[#a14d45] hover:text-[#ff7366] transition-colors border border-dashed border-[#eacfcd] rounded-xl hover:bg-white hover:border-[#ff7366]">
                                    Xem thêm các bình luận khác
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar (Sticky) (4 cols) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24 space-y-6">
                        {/* Owner Actions */}
                        {user && event.createdBy.id === user.id && (
                            <div className="bg-white rounded-2xl shadow-[0_0_0_1px_#f4e7e6,0_8px_24px_-4px_rgba(29,14,12,0.04)] border border-[#f4e7e6] p-6 space-y-4">
                                <h3 className="font-bold text-[#1d0e0c] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ff7366] filled-icon">manage_accounts</span>
                                    Quản lý sự kiện
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#1d0e0c] transition-all"
                                        onClick={() => window.alert('Tính năng chỉnh sửa đang phát triển')}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                        Chỉnh sửa
                                    </button>
                                    <button 
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                        onClick={handleDeleteEvent}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                        Xóa bỏ
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Event Details Card */}
                        <div className="bg-white rounded-2xl shadow-[0_0_0_1px_#f4e7e6,0_8px_24px_-4px_rgba(29,14,12,0.04)] border border-[#f4e7e6] overflow-hidden">
                            {/* Map Preview Top */}
                            <div className="relative h-48 w-full bg-gray-100 group cursor-pointer overflow-hidden">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                                    style={{ 
                                        backgroundImage: `url("https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude || 10.7951},${event.longitude || 106.7218}&zoom=15&size=600x300&maptype=roadmap&style=feature:poi|visibility:off&key=YOUR_API_KEY_HERE_MOCK_IMAGE")`,
                                        backgroundColor: '#e5e7eb'
                                    }}
                                >
                                    {/* Fallback layout or image could go here */}
                                </div>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="size-10 bg-[#ff7366] text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                        <span className="material-symbols-outlined filled-icon">location_on</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm text-[#1d0e0c]">
                                    Mở Google Maps
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Date */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#fef2f2] p-2.5 rounded-xl text-[#ff7366] shrink-0">
                                        <span className="material-symbols-outlined">calendar_month</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#a14d45] uppercase tracking-wide">Thời gian</p>
                                        <p className="text-[#1d0e0c] font-bold mt-0.5">{format(new Date(event.startAt), "EEEE, dd/MM/yyyy", { locale: vi })}</p>
                                        <p className="text-[#1d0e0c]/70 text-sm">
                                            {format(new Date(event.startAt), "HH:mm")}
                                            {event.endAt ? ` - ${format(new Date(event.endAt), "HH:mm")}` : ''}
                                        </p>
                                    </div>
                                </div>
                                {/* Location */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#ecfeff] p-2.5 rounded-xl text-cyan-600 shrink-0">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#a14d45] uppercase tracking-wide">Địa điểm</p>
                                        <p className="text-[#1d0e0c] font-bold mt-0.5">{event.location}</p>
                                        <p className="text-[#1d0e0c]/70 text-sm">{event.district}, {event.city}</p>
                                    </div>
                                </div>
                                {/* Price */}
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#f0fdf4] p-2.5 rounded-xl text-green-600 shrink-0">
                                        <span className="material-symbols-outlined">confirmation_number</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#a14d45] uppercase tracking-wide">Phí tham gia</p>
                                        <p className="text-green-600 font-bold mt-0.5">
                                            {event.price && event.price > 0 ? `${event.price.toLocaleString()} VND` : 'Miễn phí'}
                                        </p>
                                    </div>
                                </div>

                                {/* Pet Selector for Joining */}
                                {user && selectedPetId && pets.find(p => p.id === selectedPetId) && (
                                     <div className="border-t border-[#f4e7e6] pt-3 text-sm text-[#a14d45]">
                                         Tham gia với tư cách: <span className="font-bold">{pets.find(p => p.id === selectedPetId)?.name}</span>
                                     </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-3 pt-2">
                                    <button 
                                        onClick={handleJoinEvent}
                                        disabled={joining || !user}
                                        className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${
                                            event.isParticipating
                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-gray-200/30'
                                                : 'bg-[#ff7366] hover:bg-[#e6685c] text-white shadow-[#ff7366]/30'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {event.isParticipating ? 'check_circle' : 'add_circle'}
                                        </span>
                                        {joining ? 'Đang xử lý...' : (event.isParticipating ? 'Đã tham gia' : 'Tham gia ngay')}
                                    </button>
                                    <button 
                                        onClick={handleAddToCalendar}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-[#eacfcd] hover:border-[#ff7366] hover:text-[#ff7366] text-[#1d0e0c] font-semibold rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">event_available</span>
                                        Thêm vào lịch của Pet
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mini Promo Card */}
                        <div className="bg-gradient-to-br from-[#1d0e0c] to-[#3a1d1a] rounded-2xl p-6 text-white shadow-[0_4px_20px_-2px_rgba(29,14,12,0.05)] relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Bạn cần tìm bạn cho Corgi?</h3>
                                <p className="text-white/70 text-sm mb-4">Khám phá cộng đồng Corgi lớn nhất Việt Nam trên Pet-Connect ngay.</p>
                                <a href="/groups" className="inline-flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-lg transition-colors">
                                    Khám phá ngay <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                </a>
                            </div>
                            <div className="absolute -bottom-4 -right-4 text-white/5 rotate-[-15deg]">
                                <span className="material-symbols-outlined text-[120px] filled-icon">pets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}

function CommentItem({ comment, onReply, replyingToId, replyContent, setReplyContent, onSubmitReply, user, selectedPetId, pets, onLike }: any) {
    const isReplying = replyingToId === comment.id;

    const handleSubmit = () => {
        onSubmitReply(comment.id);
    };

    return (
        <div className="group">
            <div className="flex gap-4">
                <div 
                    className="size-10 rounded-full bg-cover bg-center shrink-0 border border-[#f4e7e6]" 
                    style={{ backgroundImage: `url("${comment.petAvatar || comment.userAvatar || '/placeholder-user.jpg'}")` }}
                ></div>
                <div className="flex-1">
                    <div className="bg-[#fcf8f8] rounded-2xl rounded-tl-none p-4">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-[#1d0e0c]">{comment.petName || comment.userName}</h4>
                            <span className="text-xs text-[#a14d45]">{format(new Date(comment.createdAt), "HH:mm dd/MM/yyyy")}</span>
                        </div>
                        <p className="text-sm text-[#1d0e0c]/80">{comment.content}</p>
                    </div>
                    <div className="flex gap-4 mt-2 ml-2">
                        <button 
                            className={`text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${comment.isLiked ? 'text-[#ff7366]' : 'text-[#a14d45] hover:text-[#ff7366]'}`}
                            onClick={() => onLike(comment.id)}
                        >
                            <span className={`material-symbols-outlined text-[16px] ${comment.isLiked ? 'filled-icon' : ''}`}>favorite</span>
                            Thích ({comment.likes || 0})
                        </button>
                        <button 
                            className="text-xs font-semibold text-[#a14d45] hover:text-[#ff7366] transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Reply clicked for:', comment.id); 
                                onReply(isReplying ? null : comment.id);
                            }}
                        >
                            {isReplying ? 'Hủy' : 'Trả lời'}
                        </button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-3 flex gap-3 animate-fade-in-down">
                            <div 
                                className="size-8 rounded-full bg-cover bg-center shrink-0 bg-gray-200" 
                                style={{ backgroundImage: `url("${(selectedPetId && pets.find((p:any) => p.id === selectedPetId)?.profilePhoto) || '/placeholder-pet.jpg'}")` }}
                            ></div>
                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full bg-white border border-[#eacfcd] rounded-xl p-2 pr-10 text-sm focus:ring-[#ff7366] focus:border-[#ff7366] resize-none"
                                    placeholder="Viết câu trả lời..."
                                    rows={1}
                                    autoFocus
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                ></textarea>
                                <button 
                                    onClick={handleSubmit}
                                    className="absolute bottom-2 right-2 text-[#ff7366] hover:text-[#e6685c]"
                                    disabled={!replyContent.trim()}
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply: any) => (
                                <CommentItem 
                                    key={reply.id} 
                                    comment={reply} 
                                    onReply={onReply}
                                    replyingToId={replyingToId}
                                    replyContent={replyContent}
                                    setReplyContent={setReplyContent}
                                    onSubmitReply={onSubmitReply}
                                    user={user}
                                    selectedPetId={selectedPetId}
                                    pets={pets}
                                    onLike={onLike}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function toggleLikeInTree(list: Comment[], id: number): Comment[] {
    return list.map(c => {
        if (c.id === id) {
            const newLiked = !c.isLiked;
            return { ...c, isLiked: newLiked, likes: (c.likes || 0) + (newLiked ? 1 : -1) };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: toggleLikeInTree(c.replies, id) };
        }
        return c;
    });
}
