'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Calendar,
  Settings,
  UserPlus,
  UserMinus,
  Lock,
  Globe,
  Crown,
  Star,
  MessageSquare,
  ImageIcon,
  PenSquare,
  ChevronRight,
  Check,
  X,
  Loader2,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getGroupBySlug,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getPendingMembers,
  approveMember,
  rejectMember,
  Group,
  GroupMember,
} from '@/services/groupService';
import authService from '@/services/authService';

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  BREED: { label: 'Giống', emoji: '🐕', color: 'from-amber-400 to-orange-400' },
  LOCATION: { label: 'Khu vực', emoji: '📍', color: 'from-blue-400 to-cyan-400' },
  INTEREST: { label: 'Sở thích', emoji: '❤️', color: 'from-pink-400 to-rose-400' },
  ACTIVITY: { label: 'Hoạt động', emoji: '🎯', color: 'from-green-400 to-emerald-400' },
  OTHER: { label: 'Khác', emoji: '✨', color: 'from-purple-400 to-indigo-400' },
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const currentUser = authService.getCurrentUser();
  useEffect(() => {
    if (slug) {
      loadGroup();
    }
  }, [slug]);
  useEffect(() => {
    if (group?.id) {
      loadMembers(group.id);
      

      if (group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR') {
        loadPendingMembers(group.id);
      }
    }
  }, [group?.id, group?.memberRole]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await getGroupBySlug(slug);
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
  const loadPendingMembers = async (groupId: number) => {
    try {
      setLoadingPending(true);
      const response = await getPendingMembers(groupId);
      if (response.success) {
        setPendingMembers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading pending members:', error);
    } finally {
      setLoadingPending(false);
    }
  };
  const handleApproveMember = async (userId: number) => {
    if (!group) return;
    try {
      setApproving(userId);
      const response = await approveMember(group.id, userId);
      if (response.success) {

        setPendingMembers(prev => prev.filter(m => m.userId !== userId));

        loadMembers(group.id);

        loadGroup();
      }
    } catch (error) {
      console.error('Error approving member:', error);
    } finally {
      setApproving(null);
    }
  };
  const handleRejectMember = async (userId: number) => {
    if (!group) return;
    try {
      setApproving(userId);
      const response = await rejectMember(group.id, userId);
      if (response.success) {

        setPendingMembers(prev => prev.filter(m => m.userId !== userId));
      }
    } catch (error) {
      console.error('Error rejecting member:', error);
    } finally {
      setApproving(null);
    }
  };

  const handleJoinLeave = async () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }

    if (!group) return;

    try {
      setJoining(true);
      if (group.isMember) {
        await leaveGroup(group.id);
      } else {
        await joinGroup(group.id);
      }

      await loadGroup();
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-400 border-r-transparent" />
          <p className="mt-4 text-gray-600 font-medium">Đang tải nhóm...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md border-0 shadow-xl">
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-xl font-bold mb-2">Không tìm thấy hội nhóm</h2>
          <p className="text-gray-500 mb-6">Nhóm này có thể đã bị xóa hoặc không tồn tại</p>
          <Button 
            onClick={() => router.push('/groups')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            Về trang hội nhóm
          </Button>
        </Card>
      </div>
    );
  }

  const categoryInfo = CATEGORY_LABELS[group.category] || CATEGORY_LABELS.OTHER;
  


  const canViewContent = !group.isPrivate || 
    (group.isMember && group.memberRole !== 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-pink-50/50">
      
      <div className="relative h-72 md:h-80">
        {group.coverImageUrl ? (
          <img
            src={group.coverImageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${categoryInfo.color}`} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-6 right-6 text-5xl opacity-20">🐾</span>
          <span className="absolute bottom-20 left-6 text-4xl opacity-20">🐕</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          
          <div className="relative -mt-24 mb-6">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  
                  <div className="relative">
                    <div className={`p-1 rounded-2xl bg-gradient-to-br ${categoryInfo.color}`}>
                      <Avatar className="h-28 w-28 md:h-36 md:w-36 rounded-xl border-4 border-white">
                        <AvatarImage src={group.avatarUrl} alt={group.name} className="rounded-xl" />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl">
                          {categoryInfo.emoji}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {group.name}
                        </h1>
                        
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`bg-gradient-to-r ${categoryInfo.color} text-white border-0 px-3 py-1`}>
                            {categoryInfo.emoji} {categoryInfo.label}
                          </Badge>
                          {group.isPrivate ? (
                            <Badge variant="outline" className="gap-1 bg-gray-50">
                              <Lock className="h-3 w-3" />
                              Riêng tư
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                              <Globe className="h-3 w-3" />
                              Công khai
                            </Badge>
                          )}
                          {group.isMember && group.memberRole && (
                            <Badge className={`gap-1 ${
                              group.memberRole === 'ADMIN' 
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white' 
                                : group.memberRole === 'MODERATOR'
                                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {group.memberRole === 'ADMIN' && <><Crown className="h-3 w-3" /> Admin</>}
                              {group.memberRole === 'MODERATOR' && <><Star className="h-3 w-3" /> Moderator</>}
                              {group.memberRole === 'MEMBER' && 'Thành viên'}
                            </Badge>
                          )}
                        </div>
                        
                        
                        <div className="flex items-center gap-5 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <div className="p-1.5 rounded-lg bg-orange-100">
                              <Users className="h-4 w-4 text-orange-600" />
                            </div>
                            <span><strong className="text-gray-900">{group.memberCount}</strong> thành viên</span>
                          </div>
                          {group.city && (
                            <div className="flex items-center gap-1.5">
                              <div className="p-1.5 rounded-lg bg-blue-100">
                                <MapPin className="h-4 w-4 text-blue-600" />
                              </div>
                              <span>{group.city}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <span>Tạo {new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>

                      
                      <div className="flex gap-3 flex-wrap">
                        {currentUser && (
                          <>
                            
                            {group.memberRole === 'PENDING' ? (
                              <Button
                                disabled
                                className="gap-2 rounded-xl px-6 bg-amber-100 text-amber-700 border-amber-200"
                                variant="outline"
                              >
                                <span className="animate-pulse">⏳</span>
                                Đang chờ duyệt
                              </Button>
                            ) : (
                              <Button
                                onClick={handleJoinLeave}
                                disabled={joining}
                                className={`gap-2 rounded-xl px-6 shadow-lg transition-all ${
                                  group.isMember 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-none' 
                                    : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-orange-200/50'
                                }`}
                                variant={group.isMember ? 'outline' : 'default'}
                              >
                                {group.isMember ? (
                                  <>
                                    <UserMinus className="h-4 w-4" />
                                    Rời nhóm
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4" />
                                    {group.isPrivate ? 'Xin tham gia' : 'Tham gia'}
                                  </>
                                )}
                              </Button>
                            )}
                            {(group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR') && (
                              <Button variant="outline" size="icon" className="rounded-xl">
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          
          <Tabs defaultValue="about" className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <TabsList className="w-full justify-start rounded-none bg-white p-0 h-auto border-b">
                <TabsTrigger 
                  value="about" 
                  className="flex-1 sm:flex-none gap-2 py-4 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50/50 data-[state=active]:text-orange-600 font-medium"
                >
                  <MessageSquare className="h-4 w-4" />
                  Giới thiệu
                </TabsTrigger>
                {canViewContent && (
                  <>
                    <TabsTrigger 
                      value="members"
                      className="flex-1 sm:flex-none gap-2 py-4 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50/50 data-[state=active]:text-orange-600 font-medium"
                    >
                      <Users className="h-4 w-4" />
                      Thành viên ({group.memberCount})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="posts"
                      className="flex-1 sm:flex-none gap-2 py-4 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50/50 data-[state=active]:text-orange-600 font-medium"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Bài viết
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </Card>

            
            <TabsContent value="about" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-xl">📖</span>
                        Về nhóm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {group.description || 'Chưa có mô tả'}
                      </p>
                    </CardContent>
                  </Card>

                  {group.rules && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-xl">📋</span>
                          Nội quy nhóm
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {group.rules}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                
                <div className="space-y-6">
                  
                  {group.admins && group.admins.length > 0 && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b py-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Crown className="h-5 w-5 text-amber-500" />
                          Quản trị viên
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {group.admins.map((admin) => (
                            <div key={admin.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                              <Avatar className="h-10 w-10 border-2 border-amber-200">
                                <AvatarImage src={admin.userAvatar} />
                                <AvatarFallback className="bg-amber-100 text-amber-700">
                                  {admin.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{admin.userName}</p>
                                <p className="text-xs text-amber-600">
                                  {admin.role === 'ADMIN' ? '👑 Admin' : '⭐ Mod'}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  
                  {(group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR') && (
                    <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-orange-400">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b py-4">
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-500" />
                            Yêu cầu tham gia
                            {pendingMembers.length > 0 && (
                              <Badge className="bg-orange-500 text-white text-xs px-2 py-0">
                                {pendingMembers.length}
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {loadingPending ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                          </div>
                        ) : pendingMembers.length === 0 ? (
                          <div className="text-center py-6">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="text-sm text-gray-500">Không có yêu cầu nào</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pendingMembers.map((member) => (
                              <div key={member.id} className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="h-10 w-10 border-2 border-orange-200">
                                    <AvatarImage src={member.userAvatar} />
                                    <AvatarFallback className="bg-orange-100 text-orange-700">
                                      {member.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{member.userName}</p>
                                    <p className="text-xs text-gray-500">
                                      Yêu cầu {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveMember(member.userId)}
                                    disabled={approving === member.userId}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs"
                                  >
                                    {approving === member.userId ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Duyệt
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectMember(member.userId)}
                                    disabled={approving === member.userId}
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Từ chối
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            
            <TabsContent value="members" className="mt-0">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">👥</span>
                      Thành viên ({group.memberCount})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingMembers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-400 border-r-transparent" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">😿</div>
                      <p className="text-gray-500">Chưa có thành viên nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-pink-50 transition-all cursor-pointer border border-gray-100 hover:border-orange-200 hover:shadow-md"
                        >
                          <Avatar className={`h-14 w-14 border-2 ${
                            member.role === 'ADMIN' ? 'border-amber-400' : 
                            member.role === 'MODERATOR' ? 'border-blue-400' : 'border-gray-200'
                          }`}>
                            <AvatarImage src={member.userAvatar} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-pink-100 text-orange-600 font-bold">
                              {member.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{member.userName}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`font-medium ${
                                member.role === 'ADMIN' ? 'text-amber-600' : 
                                member.role === 'MODERATOR' ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {member.role === 'ADMIN' && '👑 Admin'}
                                {member.role === 'MODERATOR' && '⭐ Moderator'}
                                {member.role === 'MEMBER' && 'Thành viên'}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400">
                                {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            
            <TabsContent value="posts" className="mt-0">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">📝</span>
                      Bài viết trong nhóm
                    </CardTitle>
                    {group.isMember && (
                      <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <PenSquare className="h-4 w-4" />
                        Viết bài
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài viết</h3>
                    <p className="text-gray-500 mb-6">
                      Hãy là người đầu tiên chia sẻ trong nhóm này!
                    </p>
                    {group.isMember && (
                      <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <PenSquare className="h-4 w-4" />
                        Đăng bài đầu tiên
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          
          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
