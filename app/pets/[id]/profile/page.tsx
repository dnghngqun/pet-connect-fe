'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChatContext } from '@/context/ChatContext';
import { Pet } from '@/services/petService';
import apiClient from '@/common/apiClient';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';




interface PostItem {
    id: number;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: string;
    location?: string;
    reactionsCount: number;
    commentsCount: number;
    sharesCount: number;
}

interface FollowerItem {
    id: number;
    name: string;
    avatar?: string;
}

interface PetProfile {
    id: number;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    gender: string;
    bio?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    personality?: string[];
    location?: string;
    photos?: string[];
    posts?: PostItem[];
    followers?: FollowerItem[];
    isOwner?: boolean;
    isFollowing?: boolean;
    userId?: number;
    ownerName?: string;
    ownerAvatar?: string;
}
export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const petId = resolvedParams.id;
    const router = useRouter();
    const { user } = useAuth();
    const { startChatWithUser } = useChatContext();
    
    const [pet, setPet] = useState<PetProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPet, setCurrentPet] = useState<Pet | null>(null);
    const [postInput, setPostInput] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPet = localStorage.getItem('current-pet');
            if (storedPet) {
                setCurrentPet(JSON.parse(storedPet));
            }
        }
    }, []);

    useEffect(() => {
        loadPetProfile();
    }, [petId, currentPet, user]);

    const loadPetProfile = async () => {
        try {
            setLoading(true);
            // Use profile endpoint which includes isFollowing check
            const res = await apiClient.get(`/api/v1/pets/${petId}/profile`);
            const data = res.data?.data || res.data;
            
            // Also load followers
            let followers: FollowerItem[] = [];
            try {
                const followersRes = await apiClient.get(`/api/v1/pets/${petId}/followers`);
                const followersData = followersRes.data?.data || followersRes.data || [];
                followers = followersData.map((f: any) => ({
                    id: f.id,
                    name: f.name,
                    avatar: f.avatar,
                }));
            } catch (e) {
                console.log('Could not load followers');
            }
            
            if (data) {
                const isOwner = currentPet?.id === Number(petId) || data.userId === user?._id;
                
                setPet({
                    id: data.id,
                    name: data.name,
                    species: data.type || data.species,
                    breed: data.breed,
                    age: data.age,
                    gender: data.gender,
                    bio: data.bio,
                    profilePhoto: data.profilePhoto,
                    coverPhoto: data.coverPhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC158tqb-wug4IBjOjuwdo84vymxjvgFjKBTGanyXdx7o1v-BiE7kqBo7p8icL8K3A60LQIE-XNEP4Y0BpFJiMUsbxjFDxv8CwRCi_8WC9QB5sHfieJCelezdCOMjiO5RzsC00_bkNqIVmdiqQsLSASmPqPEaq7hL-la7zKL4EZ8h_nb7ezlP5iGTb9KwBhxmv2Suzqk68HSpxZguqHtuPwleHwxc0Dt9YRa9KA8186kXPuOt51-NOI1BPUXec6BCeTm4hxMJAQ8OA',
                    isVerified: true,
                    followersCount: data.stats?.followers || 0,
                    followingCount: data.stats?.following || 0,
                    personality: data.personality || [],
                    location: 'Hà Nội, VN',
                    photos: data.photos || [],
                    posts: data.posts?.map((p: any) => ({
                        id: p.id,
                        content: p.content || p.description || p.title,
                        imageUrl: p.imageUrl,
                        videoUrl: p.videoUrl,
                        createdAt: p.createdAt,
                        location: p.location,
                        reactionsCount: p.reactionsCount || 0,
                        commentsCount: p.commentsCount || 0,
                        sharesCount: p.sharesCount || 0,
                    })) || [],
                    followers: followers,
                    isOwner,
                    isFollowing: data.isFollowing || false,
                    userId: data.userId, // Map owner ID
                    ownerName: data.ownerName || data.userName, // Backup field names if API varies
                    ownerAvatar: data.ownerAvatar || data.userAvatar
                });
            }
        } catch (error) {
            console.error('Failed to load pet profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!pet) return;
        try {
            if (pet.isFollowing) {
                await apiClient.delete(`/api/v1/pets/${petId}/follow`);
                setPet(prev => prev ? { ...prev, isFollowing: false, followersCount: (prev.followersCount || 1) - 1 } : null);
            } else {
                await apiClient.post(`/api/v1/pets/${petId}/follow`);
                setPet(prev => prev ? { ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 } : null);
            }
        } catch (error) {
            console.error('Failed to follow/unfollow:', error);
        }
    };

    const formatPostTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Vừa xong';
        if (hours < 24) return `${hours} giờ trước`;
        if (hours < 48) return 'Hôm qua';
        return format(date, 'dd/MM/yyyy', { locale: vi });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fbfaf9] dark:bg-[#21262c]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7366] border-t-transparent"></div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fbfaf9] dark:bg-[#21262c]">
                <div className="text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">pets</span>
                    <h2 className="text-xl font-bold text-[#1d0e0c] dark:text-white mb-2">Không tìm thấy thú cưng</h2>
                    <Link href="/" className="text-[#ff7366] hover:underline">Về trang chủ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fbfaf9] dark:bg-[#21262c] min-h-screen text-[#1d0e0c] dark:text-[#e0e0e0] font-['Spline_Sans',sans-serif] antialiased overflow-x-hidden selection:bg-[#ff7366] selection:text-white">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Header */}
                <header className="relative mb-6">
                    {/* Cover Photo */}
                    <div className="relative h-48 md:h-80 w-full rounded-b-3xl overflow-hidden shadow-sm group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                        <img 
                            alt="Cover photo" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            src={pet.coverPhoto}
                        />
                        {pet.isOwner && (
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <Link 
                                    href={`/pets/${pet.id}/health`}
                                    className="bg-white/90 dark:bg-black/50 backdrop-blur-sm hover:bg-white text-xs md:text-sm font-bold py-2 px-4 rounded-xl shadow-sm transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                                </Link>
                                <Link 
                                    href="/select-pet"
                                    className="bg-[#ff7366]/90 hover:bg-[#ff7366] text-white text-xs md:text-sm font-bold py-2 px-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(255,115,102,0.15)] transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                    <span className="hidden sm:inline">Chuyển đổi</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 md:px-10 relative -mt-16 z-20 flex flex-col md:flex-row items-end md:items-end gap-6" style={{ marginTop:"-44px"}}>
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="size-32 md:size-40 rounded-full border-[6px] border-[#fbfaf9] dark:border-[#21262c] bg-white overflow-hidden shadow-lg">
                                {pet.profilePhoto ? (
                                    <img className="w-full h-full object-cover" src={pet.profilePhoto} alt={pet.name} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#ff7366] to-[#ff9a8b] flex items-center justify-center text-white text-4xl font-bold">
                                        {pet.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 bg-green-500 size-5 border-4 border-white dark:border-[#21262c] rounded-full" title="Online"></div>
                        </div>

                        {/* Name & Bio */}
                        <div className="flex-1 pb-2 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#1d0e0c] dark:text-white leading-tight">{pet.name}</h1>
                                {pet.isVerified && (
                                    <span className="hidden md:flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Xác thực
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                                {pet.bio || ``}
                            </p>
                            <p className="text-sm text-[#ff7366] font-medium mt-1">@{pet.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                        </div>

                        {/* Mobile Stats */}
                        <div className="flex md:hidden w-full justify-around border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                            <div className="text-center">
                                <div className="font-bold text-lg">{pet.followersCount?.toLocaleString() || '1.2k'}</div>
                                <div className="text-xs text-gray-500">Người theo dõi</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg">{pet.followingCount?.toLocaleString() || '452'}</div>
                                <div className="text-xs text-gray-500">Đang theo dõi</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 3-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                    {/* Left Sidebar - Pet Info */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Pet Info Card */}
                            <div className="bg-white dark:bg-[#2c333a] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ff7366]">pets</span>
                                    Thông tin
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 text-sm">Giống</span>
                                        <span className="font-medium text-right">{pet.breed || pet.species || 'Golden Retriever'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 text-sm">Tuổi</span>
                                        <span className="font-medium text-right">{pet.age || 2} Tuổi</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 text-sm">Giới tính</span>
                                        <span className="font-medium text-right flex items-center gap-1">
                                            {pet.gender === 'MALE' ? 'Đực' : pet.gender === 'FEMALE' ? 'Cái' : 'Đực'} 
                                            <span className={`material-symbols-outlined text-sm ${pet.gender === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'}`}>
                                                {pet.gender === 'FEMALE' ? 'female' : 'male'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-gray-500 text-sm">Nơi ở</span>
                                        <span className="font-medium text-right text-[#ff7366] truncate max-w-[120px]">{pet.location || 'Hà Nội, VN'}</span>
                                    </div>
                                </div>
                                {!pet.isOwner && (
                                    <div className="mt-6 space-y-3">
                                        <button 
                                            onClick={handleFollow}
                                            className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group ${
                                                pet.isFollowing 
                                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-gray-200/30' 
                                                    : 'bg-[#ff7366] hover:bg-[#e05548] text-white shadow-[#ff7366]/30'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined group-hover:animate-pulse">
                                                {pet.isFollowing ? 'check' : 'add'}
                                            </span>
                                            {pet.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                 if (pet.userId) {
                                                     // Use startChatWithUser from context
                                                     startChatWithUser(pet.userId, {
                                                         id: pet.userId,
                                                         fullName: pet.ownerName || pet.name || 'Pet Owner',
                                                         avatarUrl: pet.ownerAvatar
                                                     });
                                                 } else {
                                                     router.push(`/chat?petId=${petId}`);
                                                 }
                                            }}
                                            className="w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-white dark:bg-[#2c333a] border-2 border-[#ff7366] text-[#ff7366] hover:bg-[#fff5f4] dark:hover:bg-[#3a4249]"
                                        >
                                            <span className="material-symbols-outlined">chat</span>
                                            Nhắn tin
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Personality Card */}
                            <div className="bg-white dark:bg-[#2c333a] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-500">psychology</span>
                                    Mô tả tính cách
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {pet.bio || `${pet.name} là một chú ${pet.species?.toLowerCase() || 'chó'} ${pet.breed || 'Golden'} cực kỳ thân thiện và năng động. Cậu chàng rất thích chơi đùa với trẻ em và các bạn chó khác. Đặc biệt là niềm đam mê bất tận với những quả bóng tennis và những giấc ngủ trưa dài dằng dặc.`}
                                </p>
                            </div>

                            {/* Photos Card */}
                            <div className="bg-white dark:bg-[#2c333a] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-500">photo_library</span>
                                        Ảnh
                                    </h3>
                                    <a className="text-xs text-[#ff7366] font-bold hover:underline" href="#">Xem tất cả</a>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(pet.photos && pet.photos.length > 0 ? pet.photos.slice(0, 6) : [
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCxzMWO9tPqmE__rHat8ySXpUPPF7hA48XSe1qyaujvij-uNMcGN7XBJqj6M0VIT-v1OBjAyYN2R2UNs7cGklW-lPck39t2izUMmSfEy5d8XP12hAwrmwuw5pqJWUnI6DKnQgdtSYPKmc-Qn1dyN2aJf3WDDej_4XBTC2oDBWmBbrFxRlesMBPRaei3MeWz6huejs6RXCRzIrD9oRXmJituGoWDIf6J1ndL6HxGu9ZbEsy90qwmObyWZg4FtwkciWmstbrcHeh3KvA',
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuB8QZEhBiXIoogqDBaa-UI_UMDp8HfO-QQz1MpObtz4d1xuEZfdp4AkEn6Iffjx9ny1sKZw37VA0O7HOg2fjYUsnt4Qh_AFbc-3XajkA-0tmv_TOmZXVC64IfqmqUrm8a_H9q-FXRg_kT872OkiYC9BVYf364TsDlUlUtf9G1jRNnRb48QpTAplEN5h1Soqg6035ogsgymOVgnQ2eGypESwwd3jlMCKYcAqVN1XAg2qVyz3j_EZQ7ZglhgAsCRUlsvussTnvlIbz-o',
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAJeaVfIxmQJvi1hGrJS1Z6cSXzcWSCjuzkH7TFYSQiVWzQtFLO_KAm8B26JDHzunbhUOw1oM6NtLVBB5JqHA2qnHTWgroLCbnuGN4BEegVuyZI70tZbehffwT9ygAvcLmlfTBwVuO3OApfVRHEO0gLtRcSGHzJudmvKcKNvytP3DfYKTEDqjjXuNjcaUV2aMmvZcjA4GX44D5oV1OfpX69Gki9Pn5YfknZtA-Hv0dAGz7ELJKYpNXVMwdwWADx8-baNk78-QJkFLw',
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAzgLYgWD0ZWCW_fforJWxamVGIkRSWz0HVIhIP1YEqxz_-qKbLDhfIuTd-16w-pYTcochFp3MSXcws6usJJZWOmPy8LWsvMqNCJySANn9BBBRSFcxGoTRSY5qicDKudCBsPUYxkjbuJb4eW2QwDw4Lep_7riMpdvWKqnTrOrUTe9qthZPT1VXzlopzCcdemhSXBQDs9qn5xZ6UIguP38wT7icaBi6w_vmXUiaz9gj6-mljBhLruwo3uZ1WDG1c_5E5S6h1r5ZQT-w',
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDSnGuzV8yBC8SHxfJg_g46iVZSaOD0SABuWcl9UHds1D1tv6qt-vGoCaIbO-Uo2anHXsMG-cEKCrel9Urbdodyb7P6KEh0I-p5uqyUIR-mXBwXVRpiXaXlAeybC4hao9jwCjp8_EsYIq_j_XHRsDAKMubBWU6UVKTPrTmaRkKF_O9c0VEjYO4PdWEg14X_Owj0YhSOrk2oz9g6IuxQFT2zLyND5MDxcKdvsK0cPvSlf3oTwE24UAg9rYaKJfDtORv13Y3UenK3Bp0',
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBSN2Cw3Q6tDVQw2I0sKUEKa2AtIb5yL6MZ9KjDZon1sCjyl8suOhjGs2_kVEDzwMiYcYVUeMiJTBuuRxsT4mWbMBRRV2RDYuTotFtNTlyrnHVJhHBgJhFHbZDrkncYwJuje4-b-AkRY_uHkVWu47Z70cEDatj9OOdLR0KamebvTRL1_NEUBhQLDyOlAetWov93XAxyRUsuexCXY1b0kcqWoBl4ghXf4zqmp3xa6DtpOz6rzbgWClh2yd6vMxzOFm3Op8SmLXIIVjc',
                                    ]).map((photo, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img className="w-full h-full object-cover hover:scale-110 transition-transform" src={photo} alt="" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <main className="lg:col-span-6 space-y-6">
                        {/* Create Post */}
                        {pet.isOwner && (
                            <div className="bg-white dark:bg-[#2c333a] rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                <div className="flex gap-4">
                                    <div className="size-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                        <img className="w-full h-full object-cover" src={pet.profilePhoto || ''} alt="" />
                                    </div>
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 cursor-text group">
                                        <input 
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-[#1d0e0c] dark:text-white placeholder-gray-400 outline-none" 
                                            placeholder={`${pet.name} đang nghĩ gì thế?`} 
                                            type="text"
                                            value={postInput}
                                            onChange={(e) => setPostInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-1">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">image</span>
                                            <span className="text-xs font-bold hidden sm:inline">Ảnh/Video</span>
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                                            <span className="text-xs font-bold hidden sm:inline">Cảm xúc</span>
                                        </button>
                                    </div>
                                    <button className="bg-[#ff7366] hover:bg-[#e05548] text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                                        Đăng
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        {pet.posts && pet.posts.length > 0 ? (
                            pet.posts.map((post) => (
                                <article key={post.id} className="bg-white dark:bg-[#2c333a] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                    {/* Post Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-[#ff7366]/20">
                                                <img className="w-full h-full object-cover" src={pet.profilePhoto || ''} alt="" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm leading-tight text-gray-900 dark:text-white">{pet.name}</h4>
                                                <span className="text-xs text-gray-500">{formatPostTime(post.createdAt)} {post.location && `• ${post.location} 📍`}</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-4 pb-3">
                                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">{post.content}</p>
                                    </div>

                                    {/* Post Image */}
                                    {post.imageUrl && (
                                        <div className="w-[calc(100%-2rem)] mx-auto aspect-[4/3] bg-gray-100 relative group cursor-pointer overflow-hidden rounded-lg mb-3">
                                            <img className="w-full h-full object-cover" src={post.imageUrl} alt="" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                        </div>
                                    )}

                                    {/* Reactions */}
                                    <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                <span className="z-20 inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#2c333a] bg-blue-100 text-[10px]">🐶</span>
                                                <span className="z-10 inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#2c333a] bg-red-100 text-[10px]">❤️</span>
                                            </div>
                                            <span className="hover:underline cursor-pointer">{post.reactionsCount || 156}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="hover:underline cursor-pointer">{post.commentsCount || 24} bình luận</span>
                                            <span className="hover:underline cursor-pointer">{post.sharesCount || 5} chia sẻ</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-2 pb-2">
                                        <div className="flex items-center justify-between border-t border-transparent pt-1">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#ff7366] transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                                                <span className="text-sm font-medium">Thích</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">chat_bubble</span>
                                                <span className="text-sm font-medium">Bình luận</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">share</span>
                                                <span className="text-sm font-medium">Chia sẻ</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            /* Sample posts if no real posts */
                            <>
                                <article className="bg-white dark:bg-[#2c333a] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-[#ff7366]/20">
                                                <img className="w-full h-full object-cover" src={pet.profilePhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIWZ2qQ-LjWnFLaQWPZxI500q2dNrFnsQXcMs5qydXFiBx4hi2iMvIDXy-wlYgMc9dV1lFHwoP05Wy9OINzcs8LO-tZQradeSFoHPk4Ee6zO7kWhx133T9Q4dFq1ly3hqKM11B9gqgxhOAguW7BZUypy6ECzkCZQuAmnYJZl9-4b5CQRk8z0HFltLJOZRgfzUn8ZV4jELpvBrfwjfz4JHUE9GH4clebeHIMm0eHKRt9NOFOdbZ4axBcCL88OxAnhX-4wW0IDT9E0c'} alt="" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm leading-tight text-gray-900 dark:text-white">{pet.name}</h4>
                                                <span className="text-xs text-gray-500">2 giờ trước • Hà Nội 📍</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </div>
                                    <div className="px-4 pb-3">
                                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                                            Hôm nay sen mua cho mình cái đồ chơi mới kêu chít chít vui tai lắm! Đánh giá 5 sao nhé các bạn, gặm rất đã răng! 🦴🦴🦴
                                        </p>
                                    </div>
                                    <div className="w-[calc(100%-2rem)] mx-auto aspect-[4/3] bg-gray-100 relative group cursor-pointer overflow-hidden rounded-lg mb-3">
                                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnlLGxhbAenXKqiUjrN6DR8eOkgj-9dkrDk43411V5z925U8DKP7Tdzg0S3Ie7agvejZko2L7s8J6uSJ6Qg9IayzW4SEic4PBT1BmhbCwrBbVqRv8kCQ-vY_grLTI1ZuGRYUm-qWy475cB5yxxBhS6QrFvNxPUTHUjxEvHMgs4ZZgQx9MmprgzQva731QLKuCrp_U_47xHiStMWgvLkuwu3psoz0ckUWqOU8x0VVluvJK3E0f44D4gm05ocj-G6HWB5V7Ufmb7JNI" alt="" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                    <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                <span className="z-20 inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#2c333a] bg-blue-100 text-[10px]">🐶</span>
                                                <span className="z-10 inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#2c333a] bg-red-100 text-[10px]">❤️</span>
                                            </div>
                                            <span className="hover:underline cursor-pointer">156</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="hover:underline cursor-pointer">24 bình luận</span>
                                            <span className="hover:underline cursor-pointer">5 chia sẻ</span>
                                        </div>
                                    </div>
                                    <div className="px-2 pb-2">
                                        <div className="flex items-center justify-between border-t border-transparent pt-1">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#ff7366] transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                                                <span className="text-sm font-medium">Thích</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">chat_bubble</span>
                                                <span className="text-sm font-medium">Bình luận</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">share</span>
                                                <span className="text-sm font-medium">Chia sẻ</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>

                                <article className="bg-white dark:bg-[#2c333a] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-[#ff7366]/20">
                                                <img className="w-full h-full object-cover" src={pet.profilePhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-bLawIKG89qnko2nmgFYhANyzvWi7i4syDt8waBlAWEClZr2nZnAdj39uyNua42zIeem1gI5jsBTg1KLJmm_2G2-5V0lSdKplIo5yEeqKVcqD0Liz1V9uPP2S3iPJCUEwa5xhtoHVRBwcYILl9w1LnoSyqvMyIf2oh4UdCVyPoHQ3HVj2NoIT85R4LOcSPekc_r69pi0mbcH7j274Jfhw5ysBq-HSXsgdgyBx-w566U5D8XxnOo1MyGCl-QEMVw5IBApFT4JFn-o'} alt="" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm leading-tight text-gray-900 dark:text-white">{pet.name}</h4>
                                                <span className="text-xs text-gray-500">Hôm qua • Công viên Cầu Giấy 📍</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </div>
                                    <div className="px-4 pb-3">
                                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                                            Chế độ "Zoomies" buổi sáng đã được kích hoạt! 🚀 Ai chạy đua với tớ hông?
                                        </p>
                                    </div>
                                    <div className="w-[calc(100%-2rem)] mx-auto aspect-video bg-black relative group cursor-pointer overflow-hidden rounded-lg mb-3">
                                        <img className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5PF9djAjJTNCcQZl_RUu0QTbDshkpbcnAZn9ynN3y6GxDej9dg_AuBQrC7GrRM7U3U42Z4cXXigXFZR87Alo7j2JVmo1uN0h5KAqYEEkDoowb_XcpFlu3w036W4I_yTCfwYDcgzeN_e-K7nN2meZXN5IWuYgH1n0Ejk18d4_V6BYmnHX78_EO4T76Tg9TxNsOgIFwCmWuH8kaCxwxlibDqfjGLrGVKPeB6ylQRBLbHtprAMlCEeKt5h_qeaPxxJs7irk3WZ87l1w" alt="" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="size-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/50">
                                                <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">0:45</div>
                                    </div>
                                    <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                <span className="z-20 inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white dark:ring-[#2c333a] bg-yellow-100 text-[10px]">👍</span>
                                            </div>
                                            <span className="hover:underline cursor-pointer">89</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="hover:underline cursor-pointer">12 bình luận</span>
                                            <span className="hover:underline cursor-pointer">2 chia sẻ</span>
                                        </div>
                                    </div>
                                    <div className="px-2 pb-2">
                                        <div className="flex items-center justify-between border-t border-transparent pt-1">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#ff7366] transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                                                <span className="text-sm font-medium">Thích</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">chat_bubble</span>
                                                <span className="text-sm font-medium">Bình luận</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors group">
                                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]">share</span>
                                                <span className="text-sm font-medium">Chia sẻ</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </>
                        )}
                    </main>

                    {/* Right Sidebar - Followers */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Followers Card */}
                            <div className="bg-white dark:bg-[#2c333a] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-teal-500">group</span>
                                        Người theo dõi
                                    </h3>
                                    <a className="text-xs text-[#ff7366] font-bold hover:underline" href="#">Tất cả</a>
                                </div>
                                <div className="grid grid-cols-3 gap-4 justify-items-center">
                                    {(pet.followers && pet.followers.length > 0 ? pet.followers.slice(0, 5).map((follower, i) => ({
                                        name: follower.name,
                                        img: follower.avatar || 'https://via.placeholder.com/100',
                                        border: 'border-teal-400'
                                    })) : [
                                        { name: 'Mimi', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeJRABz4_Hbz2Ihc7SJ1tDoGs3_XTVWwcz6M3EGGR6YDRIYwkC9mPfcCHWlvQjZLmWYjSx68pKiBwzVMexhMiiwbNY_7cumRLoyjholPN6jnKe7AKntOZC7wGeAsP2ZzFNMrMVWD3-G_UveQfqXZJiYkKyNDXEWmlF3wzgf4BMg3HFv2xihfcHpIRtdGsnHkoVWw2xW22idjxBWp5W7-pwNfRcEbyaq0DYIIm_3-nyKahn81_kDAKY79Uuq07Lmsb8o3uhEjEzhPs', border: 'border-teal-400' },
                                        { name: 'Tank', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGHs6WDn8nUV72VJl3j-VjjRWz_No4D8uDGxX85zx23KVTmHk9mAqOASoOYRcauPRNLOzVnNaHs22-1q1JFv0-82KT-huCGQXEUSJc047qgLHwKUgGDByvg0j6Kqff8E4Dd3Liij51LzPcxQnmkKelN9SaZFJEmSvd_Hkao5iwMrixgEWbVYp2oYxP91tnH049Lv2pyM_Ayc180g0SHL93k8LPoT0ny1h0c7cH5bShdOPJ2zaRrttO5Lcaiv_XufH09rGc3y3M3GY', border: 'border-teal-400' },
                                        { name: 'Lucky', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVrIYs4KJPPDJ5ol4Ur7b9KIfTo6teQmj5AsUbVBnsJFGDJODKOk2IetQtu9ugrm9T9AZ9hmllNpORuT_RDjIieNf24Bog7JMORh-sflvuf8OjgIvEayXZLF-4yDbgpx0Gfxp91Z9GH852csuAo4Q6X4HjZszEuW1SHEfmbvZdzuWp5yh9t2lw-72WjyCyTSP04r-MiQlNSkil8Hqllxj5hoMOfRC80aXESCMPvSho57pyg9Whki_oqZLTFMz37-3Te_qFOBUdk7Y', border: 'border-dashed border-gray-300' },
                                        { name: 'Potato', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMOW7ySSXnZpJNIIIBh7b2knKNg8Tm0lBPZ863RmnzVLPm_UKAvljKb0gBHEXt1VwMUyEJkaDSWmi_CwBN7Y7Z905AKuQIEojVubFGPMNGAbHq42rt1MPNcSV0p7IATyxzZAVve4L-ZJ0F_99tF3y-6ivuu2LGsX_Yfai2zv9MpxHc-jouCEH-_VEHQouA0mcGnAAgSFCEDBUXmvTaZXXW5DxnF95vSAbPsjo0iSIL2ROBFP3GvN7v53ir8PILDRj97nnSnuZ_Iys', border: 'border-teal-400' },
                                        { name: 'Bông', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8i6xTPZNTS2YpSgxZwIIySAXBcF6YElY8rgMvjSvHZwwF_0auOXZAQx9oljqEirKqL2mGFXRzL8z8qIX1qW-_XXtrTwx8auiBwRTyJUJJ3fcd9bCnoXUoa4uvLRoJbVB9dltVR5vzmbXwSL9eJ_Nwr81Q1lANbBgjpTbRhQ6ewRLvpeqUl0QBYvT4eWpnIvPjrmbr0f3Jph67eDFcHtnMSYEf6YxGJ6R9pgsxiaThL9RXdb7p7ZQDqjqN-sIfNySEllrlUndyVw', border: 'border-dashed border-gray-300' },
                                    ]).map((follower, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer">
                                            <div className={`size-14 rounded-full p-0.5 border-2 ${follower.border} bg-white`}>
                                                <img className="w-full h-full rounded-full object-cover" src={follower.img} alt="" />
                                            </div>
                                            <span className="text-xs font-medium truncate w-16 text-center group-hover:text-[#ff7366]">{follower.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                        <div className="size-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#ff7366] hover:bg-[#ff7366]/5 transition-colors">
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-[#ff7366]">add</span>
                                        </div>
                                        <span className="text-xs font-medium truncate w-16 text-center">Thêm</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap gap-x-4 gap-y-2 px-2">
                                <a className="text-xs text-gray-400 hover:text-gray-600" href="#">Quyền riêng tư</a>
                                <a className="text-xs text-gray-400 hover:text-gray-600" href="#">Điều khoản</a>
                                <a className="text-xs text-gray-400 hover:text-gray-600" href="#">Quảng cáo</a>
                                <span className="text-xs text-gray-300">© 2024 Pet-Connect</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
