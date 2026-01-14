import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import { Loader2, Search as SearchIcon, Users, PawPrint, Bone, Heart, Cat, Calendar, Users2 } from 'lucide-react';
import searchService, { SearchResponse } from '@/services/searchService';
import PetPostCard from '@/components/pet-post-card';
import PostDetailModal from '@/components/post-detail-modal';
import type { PetPost } from '@/lib/types';
import PostCardSkeleton from '@/components/post-card-skeleton';
import Link from 'next/link';
import { Group } from '@/services/groupService';
import EventCard from '@/components/event-card';

// Define User type to match API response
interface UserResult {
  id: number;
  fullName: string;
  avatarUrl: string;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({
    posts: [],
    users: [],
    pets: [],
    groups: [],
    events: []
  });

  // Modal state
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await searchService.search(searchQuery);
      if (response && response.success) {
        setResults({
            posts: response.data.posts || [],
            users: response.data.users || [],
            pets: response.data.pets || [],
            groups: response.data.groups || [],
            events: response.data.events || []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: PetPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
    
    if (post.id && /^\d+$/.test(post.id.toString())) {
       import('@/services/trendingService').then(mod => {
          mod.default.trackView(post.id.toString());
       });
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  const getTotalResults = () => {
    return (results.posts?.length || 0) + 
           (results.users?.length || 0) + 
           (results.pets?.length || 0) + 
           (results.groups?.length || 0) + 
           (results.events?.length || 0);
  };

  return (
    <div className="min-h-screen py-6 relative">
      {/* Decorative stickers */}
      <div className="absolute top-20 left-8 text-orange-200/40 animate-bounce">
        <PawPrint size={32} />
      </div>
      <div className="absolute top-40 right-12 text-amber-200/40 animate-pulse">
        <Heart size={28} />
      </div>
      <div className="absolute bottom-32 left-16 text-yellow-200/40">
        <Bone size={36} className="rotate-45" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header with search - Glassmorphism style */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
              <SearchIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tìm kiếm
              </h1>
              <p className="text-sm text-muted-foreground">Khám phá thế giới thú cưng 🐾</p>
            </div>
          </div>
          <SearchBar 
            onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
            showResults={false}
            className="max-w-2xl"
          />
        </div>

        {query && (
          <>
            {/* Results header */}
            <div className="mb-4 flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-400" />
              <p className="text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <>
                    Tìm thấy <span className="font-semibold text-orange-600">{getTotalResults()}</span> kết quả cho{' '}
                    <span className="font-semibold text-foreground">"{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Filter tabs - Styled */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/70 backdrop-blur-sm mb-6 p-1.5 h-auto flex-wrap rounded-xl border border-white/50 shadow-sm">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  🐾 Tất cả
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Users className="h-4 w-4"/> Mọi người
                  <span className="ml-1 text-xs bg-white/20 px-1.5 rounded-full">{results.users?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Cat className="h-4 w-4"/> Bài viết
                  <span className="ml-1 text-xs bg-white/20 px-1.5 rounded-full">{results.posts?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="pets" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <PawPrint className="h-4 w-4"/> Thú cưng
                  <span className="ml-1 text-xs bg-white/20 px-1.5 rounded-full">{results.pets?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="groups" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Users2 className="h-4 w-4"/> Nhóm
                  <span className="ml-1 text-xs bg-white/20 px-1.5 rounded-full">{results.groups?.length || 0}</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Calendar className="h-4 w-4"/> Sự kiện
                  <span className="ml-1 text-xs bg-white/20 px-1.5 rounded-full">{results.events?.length || 0}</span>
                </TabsTrigger>
              </TabsList>

              {/* ALL Tab Content (Simplified: show top results from each) */}
              <TabsContent value="all" className="space-y-8">
                 {/* Users Preview */}
                 {results.users && results.users.length > 0 && (
                    <section>
                       <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-orange-500"/> Mọi người</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.users.slice(0, 3).map(user => (
                             <UserCard key={user.id} user={user} onClick={handleUserClick} />
                          ))}
                       </div>
                    </section>
                 )}

                 {/* Groups Preview */}
                 {results.groups && results.groups.length > 0 && (
                    <section>
                       <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Users2 className="h-5 w-5 text-orange-500"/> Nhóm</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.groups.slice(0, 3).map(group => (
                             <GroupCard key={group.id} group={group} />
                          ))}
                       </div>
                    </section>
                 )}

                 {/* Events Preview */}
                 {results.events && results.events.length > 0 && (
                    <section>
                       <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-orange-500"/> Sự kiện</h3>
                       <div className="space-y-4">
                          {results.events.slice(0, 2).map(event => (
                            // @ts-ignore
                             <EventCard key={event.id} event={event} />
                          ))}
                       </div>
                    </section>
                 )}
                 
                 {/* Pets Preview */}
                 {results.pets && results.pets.length > 0 && (
                    <section>
                       <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><PawPrint className="h-5 w-5 text-orange-500"/> Thú cưng</h3>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {results.pets.slice(0, 4).map(pet => (
                             <PetCard key={pet.id} pet={pet} />
                          ))}
                       </div>
                    </section>
                 )}

                 {/* Posts Preview */}
                 {results.posts && results.posts.length > 0 && (
                    <section>
                       <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Cat className="h-5 w-5 text-orange-500"/> Bài viết</h3>
                       <div className="space-y-4">
                          {results.posts.slice(0, 3).map(post => (
                             <PetPostCard key={post.id} post={post} onPostClick={handlePostClick} />
                          ))}
                       </div>
                    </section>
                 )}
              </TabsContent>

              {/* Individual Tabs */}
              <TabsContent value="users">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.map(user => (
                       <UserCard key={user.id} user={user} onClick={handleUserClick} />
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="groups">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.groups.map(group => (
                       <GroupCard key={group.id} group={group} />
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="events">
                 <div className="space-y-4">
                    {results.events.map(event => (
                       // @ts-ignore
                       <EventCard key={event.id} event={event} />
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="pets">
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.pets.map(pet => (
                       <PetCard key={pet.id} pet={pet} />
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="posts">
                 <div className="space-y-4">
                    {results.posts.map(post => (
                       <PetPostCard key={post.id} post={post} onPostClick={handlePostClick} />
                    ))}
                 </div>
              </TabsContent>

            </Tabs>
          </>
        )}

        {!query && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
            {/* ... (keep existing empty state) */}
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6">
              <SearchIcon className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Tìm kiếm đa năng
            </h3>
            <p className="text-muted-foreground mb-6">
              Tìm bài viết, mọi người, nhóm, sự kiện và thú cưng tại đây 🐾
            </p>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          open={isPostModalOpen}
          onOpenChange={setIsPostModalOpen}
        />
      )}
    </div>
  );
}

// Sub-components for cleaner code
const UserCard = ({ user, onClick }: { user: UserResult, onClick: (id: number) => void }) => (
  <div 
    onClick={() => onClick(user.id)}
    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-4"
  >
     <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden flex-shrink-0 ring-2 ring-orange-200/50">
       <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt={user.fullName} className="h-full w-full object-cover" />
     </div>
     <div className="min-w-0">
       <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
       <p className="text-sm text-orange-500 flex items-center gap-1">
         <PawPrint className="h-3 w-3" /> Người dùng
       </p>
     </div>
  </div>
);

const GroupCard = ({ group }: { group: Group }) => (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full border border-white/50`}>
      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${group.coverImageUrl || "https://images.unsplash.com/photo-1599141022634-11818274718c?w=500"}')` }}>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/groups/${group.slug}`}>
          <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{group.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users2 className="h-4 w-4"/>
            {group.memberCount} thành viên
          </div>
        </div>
      </div>
    </div>
);

const PetCard = ({ pet }: { pet: any }) => (
  <Link href={`/pets/${pet.id}/public`} className="block">
     <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/50 hover:shadow-md hover:scale-[1.02] transition-all flex flex-col items-center text-center">
         <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden mb-2 ring-2 ring-orange-200">
             <img src={pet.profilePhoto || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'} alt={pet.name} className="h-full w-full object-cover" />
         </div>
         <h3 className="font-bold text-gray-900 truncate w-full">{pet.name}</h3>
         <p className="text-xs text-muted-foreground truncate w-full">{pet.breed || 'Không rõ giống'}</p>
     </div>
  </Link>
);

