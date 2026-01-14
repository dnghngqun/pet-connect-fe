'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getGroupBySlug,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getPendingMembers,
  approveMember,
  rejectMember,
  removeMember,
  getGroupPosts,
  Group,
  GroupMember,
} from '@/services/groupService';
import authService from '@/services/authService';
import petService, { Pet } from '@/services/petService';
import PostCard from '@/components/dashboard/post-card';
import CreatePostModal from '@/components/dashboard/create-post-modal';
import PetSelectionModal from '@/components/groups/pet-selection-modal';
import { toast } from 'react-hot-toast';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('discussion');
  const [kickingMember, setKickingMember] = useState<number | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const currentUser = authService.getCurrentUser();
  
  // Pet Selection State
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [isPetSelectorOpen, setIsPetSelectorOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'JOIN' | 'LEAVE'>('JOIN');
  
  // Get current pet from localStorage
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  useEffect(() => {
    const storedPet = localStorage.getItem('current-pet');
    if (storedPet) {
      setCurrentPet(JSON.parse(storedPet));
    }
    loadMyPets();
  }, []);

  const loadMyPets = async () => {
    try {
      const response = await petService.getMyPets();
      if (response.success && Array.isArray(response.data)) {
        setMyPets(response.data);
      }
    } catch (error) {
      console.error('Error loading my pets:', error);
    }
  };

  useEffect(() => {
    if (slug && currentPet) {
      loadGroup();
    }
  }, [slug, currentPet?.id]);

  useEffect(() => {
    if (group?.id) {
      loadMembers(group.id);
      if (group.isMember && group.memberRole !== 'PENDING') {
        loadPosts(group.id);
      }
      if (group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR') {
        loadPendingMembers(group.id);
      }
    }
  }, [group?.id, group?.memberRole, group?.isMember]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await getGroupBySlug(slug, currentPet?.id);
      if (response.success) {
        setGroup(response.data);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (groupId: number) => {
    try {
      setLoadingMembers(true);
      const response = await getGroupMembers(groupId, 0, 50);
      if (response.success) {
        setMembers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadPosts = async (groupId: number) => {
    try {
      setLoadingPosts(true);
      const response = await getGroupPosts(groupId, 0, 20);
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadPendingMembers = async (groupId: number) => {
    if (!currentPet) return;
    try {
      const response = await getPendingMembers(groupId, currentPet.id);
      if (response.success) {
        setPendingMembers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading pending:', error);
    }
  };

  const handleJoinClick = () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    setSelectorMode('JOIN');
    setIsPetSelectorOpen(true);
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    if (!group || !currentPet) {
      toast.error('Vui lòng chọn thú cưng');
      return;
    }
    
    try {
      setJoining(true);
      await leaveGroup(group.id, currentPet.id);
      await loadGroup();
      await loadMembers(group.id);
      toast.success(`${currentPet.name} đã rời nhóm`);
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setJoining(false);
    }
  };

  const handlePetSelectionconfirm = async (petId: number) => {
    if (!group) return;
    
    try {
      setJoining(true);
      setIsPetSelectorOpen(false);

      const response: any = await joinGroup(group.id, petId);
      if (response.error) {
         toast.error(response.message || "Không thể tham gia nhóm");
      } else {
        toast.success('Đã tham gia nhóm thành công!');
      }
      await loadGroup();
      await loadMembers(group.id);
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setJoining(false);
    }
  };

  // Replaces handleJoinLeave
  const handleJoinLeaveAction = () => {
    if (group?.isMember) {
      handleLeaveGroup();
    } else {
      handleJoinClick();
    }
  };

  const handleApproveMember = async (petId: number) => {
    if (!group || !currentPet) return;
    try {
      await approveMember(group.id, petId, currentPet.id);
      setPendingMembers(prev => prev.filter(m => m.petId !== petId));
      loadMembers(group.id);
      loadGroup();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRejectMember = async (petId: number) => {
    if (!group || !currentPet) return;
    try {
      await rejectMember(group.id, petId, currentPet.id);
      setPendingMembers(prev => prev.filter(m => m.petId !== petId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKickMember = async (petId: number) => {
    if (!group || !currentPet) return;
    try {
      setKickingMember(petId);
      await removeMember(group.id, petId, currentPet.id);
      setMembers(prev => prev.filter(m => m.petId !== petId));
      loadGroup();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setKickingMember(null);
    }
  };

  const handleCreatePost = () => {
    if (group && currentPet) {
      setIsCreatePostOpen(true);
    }
  };

  const handlePostCreated = () => {
    if (group) {
      loadPosts(group.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ff7366] border-r-transparent" />
          <p className="mt-4 text-[#a14d45] font-medium">Đang tải nhóm...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center max-w-md border border-[#f4e7e6]">
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-xl font-bold mb-2 text-[#1d0e0c]">Không tìm thấy nhóm</h2>
          <p className="text-[#a14d45] mb-6">Nhóm này có thể đã bị xóa hoặc không tồn tại</p>
          <button 
            onClick={() => router.push('/groups')}
            className="bg-[#ff7366] hover:bg-[#e6685c] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Về trang cộng đồng
          </button>
        </div>
      </div>
    );
  }

  const canViewContent = !group.isPrivate || (group.isMember && group.memberRole !== 'PENDING');
  const isAdmin = group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR';

  return (
    <div className="bg-[#fcf8f8] min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-[#a14d45]">
          <Link href="/" className="hover:text-[#ff7366] flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">home</span>
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/groups" className="hover:text-[#ff7366]">Cộng đồng</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-[#1d0e0c]">{group.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl shadow-card border border-[#f4e7e6] overflow-hidden">
          {/* Cover Image */}
          <div 
            className="h-[200px] sm:h-[300px] w-full bg-cover bg-center relative"
            style={{ backgroundImage: group.coverImageUrl ? `url("${group.coverImageUrl}")` : 'linear-gradient(to right, #ff7366, #e6685c)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Group Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 -mt-12 sm:-mt-16 mb-4 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full sm:w-auto text-center sm:text-left">
                {/* Avatar */}
                <div 
                  className="size-32 rounded-full border-4 border-white shadow-lg bg-cover bg-center shrink-0 bg-[#f4e7e6]"
                  style={{ backgroundImage: group.avatarUrl ? `url("${group.avatarUrl}")` : undefined }}
                >
                  {!group.avatarUrl && <div className="w-full h-full rounded-full flex items-center justify-center text-4xl">🐾</div>}
                </div>
                <div className="mb-2" style={{
                  background: "#ffffff",
                  padding: "10px",
                  borderRadius: "30px",
                  marginLeft:"-10px"
                }}
                  >
                  <h1 className="text-3xl font-extrabold text-[#1d0e0c]  sm:drop-shadow-md">{group.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[#1d0e0c]  font-medium text-sm mt-3">
                    <span className="material-symbols-outlined text-[18px] filled-icon">{group.isPrivate ? 'lock' : 'public'}</span>
                    <span>{group.isPrivate ? 'Nhóm Riêng tư' : 'Nhóm Công khai'}</span>
                    <span>•</span>
                    <span>{group.memberCount.toLocaleString()} Thành viên</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto justify-center">
                {group.memberRole === 'PENDING' ? (
                  <button disabled className="bg-amber-100 text-amber-700 font-semibold px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                    <span className="animate-pulse">⏳</span>
                    Đang chờ duyệt
                  </button>
                ) : (
                  <button 
                    onClick={handleJoinLeaveAction}
                    disabled={joining}
                    className={`font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-2 ${
                      group.isMember 
                        ? 'bg-white hover:bg-gray-50 text-[#1d0e0c] border border-[#f4e7e6]'
                        : 'bg-[#ff7366] hover:bg-[#e6685c] text-white shadow-lg shadow-[#ff7366]/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{group.isMember ? 'group_remove' : 'group_add'}</span>
                    {group.isMember ? 'Rời nhóm' : (group.isPrivate ? 'Xin tham gia' : 'Tham gia')}
                  </button>
                )}
                
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-[#f4e7e6] pt-2 mt-6 sm:mt-2">
              <nav className="flex gap-6 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'discussion' 
                      ? 'text-[#ff7366] border-b-2 border-[#ff7366] font-bold' 
                      : 'text-[#a14d45] hover:text-[#1d0e0c]'
                  }`}
                >
                  Thảo luận
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'about' 
                      ? 'text-[#ff7366] border-b-2 border-[#ff7366] font-bold' 
                      : 'text-[#a14d45] hover:text-[#1d0e0c]'
                  }`}
                >
                  Giới thiệu
                </button>
                {canViewContent && (
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'members' 
                        ? 'text-[#ff7366] border-b-2 border-[#ff7366] font-bold' 
                        : 'text-[#a14d45] hover:text-[#1d0e0c]'
                    }`}
                  >
                    Thành viên
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('manage')}
                    className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      activeTab === 'manage' 
                        ? 'text-[#ff7366] border-b-2 border-[#ff7366] font-bold' 
                        : 'text-[#a14d45] hover:text-[#1d0e0c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    Quản lý
                    {pendingMembers.length > 0 && (
                      <span className="bg-[#ff7366] text-white text-xs px-1.5 py-0.5 rounded-full">{pendingMembers.length}</span>
                    )}
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Discussion Tab */}
            {activeTab === 'discussion' && (
              <>
                {/* Create Post Box */}
                {group.isMember && group.memberRole !== 'PENDING' && (
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-card border border-[#f4e7e6]">
                    <div className="flex gap-4 mb-4">
                      <div 
                        className="size-10 rounded-full bg-[#f4e7e6] shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: currentPet?.profilePhoto ? `url("${currentPet.profilePhoto}")` : undefined }}
                      ></div>
                      <input 
                        onClick={handleCreatePost}
                        className="w-full bg-[#fcf8f8] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#ff7366]/20 hover:bg-[#f4e7e6] transition-colors cursor-pointer placeholder-[#a14d45]"
                        placeholder={`${currentPet?.name || 'Bạn'} ơi, hôm nay có gì mới?`}
                        readOnly
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-[#f4e7e6] pt-3">
                      <div className="flex gap-2">
                        <button onClick={handleCreatePost} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#fcf8f8] rounded-lg text-[#a14d45] text-sm font-medium transition-colors">
                          <span className="material-symbols-outlined text-green-500 text-[20px]">image</span>
                          Ảnh/Video
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#fcf8f8] rounded-lg text-[#a14d45] text-sm font-medium transition-colors">
                          <span className="material-symbols-outlined text-yellow-500 text-[20px]">sentiment_satisfied</span>
                          Cảm xúc
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts */}
                {!canViewContent ? (
                  <div className="bg-white rounded-2xl p-12 shadow-card border border-[#f4e7e6] text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-lg font-semibold text-[#1d0e0c] mb-2">Nội dung riêng tư</h3>
                    <p className="text-[#a14d45] mb-6">Tham gia nhóm để xem bài viết</p>
                    <button 
                      onClick={handleJoinLeaveAction}
                      disabled={joining}
                      className="bg-[#ff7366] hover:bg-[#e6685c] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                    >
                      {group.isPrivate ? 'Xin tham gia' : 'Tham gia ngay'}
                    </button>
                  </div>
                ) : loadingPosts ? (
                  <div className="flex justify-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ff7366] border-r-transparent" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-card border border-[#f4e7e6] text-center">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-lg font-semibold text-[#1d0e0c] mb-2">Chưa có bài viết</h3>
                    <p className="text-[#a14d45] mb-6">Hãy là người đầu tiên chia sẻ trong nhóm này!</p>
                    {group.isMember && (
                      <button 
                        onClick={handleCreatePost}
                        className="bg-[#ff7366] hover:bg-[#e6685c] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 mx-auto"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        Đăng bài đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                <h3 className="font-bold text-lg text-[#1d0e0c] mb-4">Giới thiệu</h3>
                <p className="text-[#1d0e0c]/80 text-sm mb-6 whitespace-pre-wrap">
                  {group.description || 'Chưa có mô tả'}
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#a14d45] text-[20px] mt-0.5">{group.isPrivate ? 'lock' : 'public'}</span>
                    <div>
                      <p className="text-sm font-bold text-[#1d0e0c]">{group.isPrivate ? 'Riêng tư' : 'Công khai'}</p>
                      <p className="text-xs text-[#a14d45]">
                        {group.isPrivate 
                          ? 'Chỉ thành viên mới có thể xem nội dung nhóm.'
                          : 'Ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a14d45] text-[20px]">history</span>
                    <div>
                      <p className="text-sm font-bold text-[#1d0e0c]">
                        Đã tạo {new Date(group.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && canViewContent && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                <h3 className="font-bold text-lg text-[#1d0e0c] mb-4">Thành viên ({group.memberCount})</h3>
                {loadingMembers ? (
                  <div className="flex justify-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ff7366] border-r-transparent" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#fcf8f8] hover:bg-[#f4e7e6] transition-colors">
                        <div 
                          className="size-12 rounded-full bg-cover bg-center bg-[#eacfcd]"
                          style={{ backgroundImage: member.petAvatar ? `url("${member.petAvatar}")` : undefined }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1d0e0c] truncate">{member.petName}</p>
                          <p className={`text-xs font-medium ${
                            member.role === 'ADMIN' ? 'text-amber-600' : 
                            member.role === 'MODERATOR' ? 'text-blue-600' : 'text-[#a14d45]'
                          }`}>
                            {member.role === 'ADMIN' && '👑 Admin'}
                            {member.role === 'MODERATOR' && '⭐ Moderator'}
                            {member.role === 'MEMBER' && 'Thành viên'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Manage Tab */}
            {activeTab === 'manage' && isAdmin && (
              <div className="space-y-6">
                {/* Pending Requests */}
                {pendingMembers.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                    <h3 className="font-bold text-lg text-[#1d0e0c] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ff7366]">pending</span>
                      Yêu cầu tham gia ({pendingMembers.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                          <div 
                            className="size-12 rounded-full bg-cover bg-center bg-amber-200"
                            style={{ backgroundImage: member.petAvatar ? `url("${member.petAvatar}")` : undefined }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1d0e0c]">{member.petName}</p>
                            <p className="text-xs text-[#a14d45]">
                              Yêu cầu {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveMember(member.petId)}
                              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Duyệt
                            </button>
                            <button 
                              onClick={() => handleRejectMember(member.petId)}
                              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Management */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                  <h3 className="font-bold text-lg text-[#1d0e0c] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff7366]">manage_accounts</span>
                    Quản lý thành viên
                  </h3>
                  <div className="space-y-3">
                    {members.filter(m => m.role !== 'ADMIN').map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#fcf8f8] hover:bg-[#f4e7e6] transition-colors">
                        <div 
                          className="size-12 rounded-full bg-cover bg-center bg-[#eacfcd]"
                          style={{ backgroundImage: member.petAvatar ? `url("${member.petAvatar}")` : undefined }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1d0e0c] truncate">{member.petName}</p>
                          <p className={`text-xs font-medium ${
                            member.role === 'MODERATOR' ? 'text-blue-600' : 'text-[#a14d45]'
                          }`}>
                            {member.role === 'MODERATOR' && '⭐ Moderator'}
                            {member.role === 'MEMBER' && 'Thành viên'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleKickMember(member.petId)}
                          disabled={kickingMember === member.petId}
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          {kickingMember === member.petId ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-r-transparent" />
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">person_remove</span>
                              Xóa
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              {/* About Card */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                <h3 className="font-bold text-lg text-[#1d0e0c] mb-4">Giới thiệu</h3>
                <p className="text-[#1d0e0c]/80 text-sm mb-4 line-clamp-3">
                  {group.description || 'Cộng đồng yêu thú cưng'}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a14d45] text-[20px]">{group.isPrivate ? 'lock' : 'public'}</span>
                    <p className="text-sm text-[#1d0e0c]">{group.isPrivate ? 'Riêng tư' : 'Công khai'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a14d45] text-[20px]">group</span>
                    <p className="text-sm text-[#1d0e0c]">{group.memberCount.toLocaleString()} thành viên</p>
                  </div>
                </div>
              </div>

              {/* New Members */}
              {canViewContent && members.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-[#f4e7e6]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-[#1d0e0c]">Thành viên mới</h3>
                    <button onClick={() => setActiveTab('members')} className="text-xs font-bold text-[#ff7366] hover:text-[#e6685c]">Xem tất cả</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {members.slice(0, 8).map((member) => (
                      <div 
                        key={member.id}
                        className="aspect-square rounded-xl bg-cover bg-center bg-[#f4e7e6]"
                        style={{ backgroundImage: member.petAvatar ? `url("${member.petAvatar}")` : undefined }}
                        title={member.petName}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#a14d45] px-2">
                <a className="hover:underline" href="#">Quyền riêng tư</a>
                <a className="hover:underline" href="#">Điều khoản</a>
                <span>Pet-Connect © 2024</span>
              </div>
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
        .filled-icon {
          font-variation-settings: 'FILL' 1;
        }
        .shadow-card {
          box-shadow: 0 0 0 1px #f4e7e6, 0 8px 24px -4px rgba(29, 14, 12, 0.04);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Create Post Modal */}
      {currentPet && group && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          pet={currentPet}
          onPostCreated={handlePostCreated}
          groupId={group.id}
        />
      )}

      {/* Pet Selection Modal */}
      <PetSelectionModal
        isOpen={isPetSelectorOpen}
        onClose={() => setIsPetSelectorOpen(false)}
        pets={myPets}
        onConfirm={handlePetSelectionconfirm}
        title={selectorMode === 'JOIN' ? "Chọn thú cưng tham gia nhóm" : "Chọn thú cưng rời nhóm"}
        loading={joining}
      />
    </div>
  );
}
