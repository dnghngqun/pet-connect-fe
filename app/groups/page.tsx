'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GroupCard from '@/components/group-card';
import { getGroups, getPopularGroups, Group } from '@/services/groupService';
import authService from '@/services/authService';
import PageHeader from '@/components/page-header'; // Keeping import but might not use it or will use it differently

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadGroups();
    loadPopularGroups();
  }, [category, city]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search || category || city) {
        loadGroups();
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await getGroups({
        category: category || undefined,
        city: city || undefined,
        search: search || undefined,
        page: 0,
        size: 20,
      });

      if (response.success) {
        setGroups(response.data || []);
        setHasMore((response.data || []).length === 20);
        setPage(0);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularGroups = async () => {
    try {
      const response = await getPopularGroups(5);
      if (response.success) {
        setPopularGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error loading popular groups:', error);
    }
  };

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const response = await getGroups({
        category: category || undefined,
        city: city || undefined,
        search: search || undefined,
        page: nextPage,
        size: 20,
      });

      if (response.success) {
        setGroups((prev) => [...prev, ...(response.data || [])]);
        setHasMore((response.data || []).length === 20);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more groups:', error);
    }
  };

  const handleCreateGroup = () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    router.push('/groups/create');
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title Section */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Groups</h1>
              <p className="text-muted-foreground mt-1">Discover and join communities just for you and your pet.</p>
            </div>
            <Button onClick={handleCreateGroup} className="rounded-xl shadow-md hover:shadow-lg transition-all">
               <Plus className="w-5 h-5 mr-2" />
               Create New Group
            </Button>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 sticky top-24 space-y-6">
              <div className="bg-card rounded-2xl shadow-soft p-5 border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                   <Filter className="h-5 w-5 text-primary" />
                   Filters
                </h3>

                {/* Search */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Find a group..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Category</label>
                  <Select value={category} onValueChange={(val) => setCategory(val === 'ALL' ? '' : val)}>
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="BREED">Breed Specific</SelectItem>
                      <SelectItem value="LOCATION">Location Based</SelectItem>
                      <SelectItem value="INTEREST">Interests</SelectItem>
                      <SelectItem value="ACTIVITY">Activities</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">City</label>
                  <Select value={city} onValueChange={(val) => setCity(val === 'ALL' ? '' : val)}>
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Cities</SelectItem>
                      <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                    <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setSearch('');
                            setCategory('');
                            setCity('');
                        }}
                    >
                        Reset Filters
                    </Button>
                </div>
              </div>

               {/* Popular Groups (Sidebar) */}
               {popularGroups.length > 0 && (
                  <div className="bg-card rounded-2xl shadow-soft p-5 border border-border">
                    <h3 className="font-bold text-foreground mb-4">Popular</h3>
                    <div className="space-y-3">
                      {popularGroups.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => router.push(`/groups/${group.slug}`)}
                          className="flex items-center gap-3 cursor-pointer p-2 -mx-2 hover:bg-muted/50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-200 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${group.avatarUrl || ''}')` }}></div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{group.name}</p>
                             <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              {loading && groups.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                   <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                </div>
              ) : groups.length === 0 ? (
                <div className="bg-card rounded-2xl shadow-soft p-12 text-center border border-border dashed">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No groups found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or create your own community!</p>
                  <Button onClick={() => {
                    setSearch('');
                    setCategory('');
                    setCity('');
                  }} variant="outline" className="rounded-xl">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-10">
                      <Button onClick={loadMore} variant="outline" className="rounded-xl px-8">
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
      </div>
    </div>
  );
}
