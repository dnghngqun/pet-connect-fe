'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EventCard, { Event } from '@/components/event-card';

// Mock Data for now as no service exists yet
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    slug: 'puppy-yoga-in-park',
    title: 'Puppy Yoga in the Park',
    description: 'Join us for a relaxing morning of yoga with your furry friends!',
    startTime: '2024-06-15T09:00:00',
    location: 'Central Park West',
    coverImageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop',
    hostName: 'Yoga Pets Club',
    interestedCount: 45,
    goingCount: 20,
    isOnline: false,
    category: 'Activity'
  },
  {
    id: '2',
    slug: 'cat-nutrition-webinar',
    title: 'Feline Nutrition Toolkit Webinar',
    description: 'Learn everything about healthy diet for your cats.',
    startTime: '2024-06-18T18:00:00',
    location: 'Online (Zoom)',
    coverImageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
    hostName: 'Dr. Meow',
    interestedCount: 120,
    goingCount: 88,
    isOnline: true,
    category: 'Education'
  },
  {
    id: '3',
    slug: 'dog-meetup-beach',
    title: 'Golden Retriever Beach Day',
    description: 'Sun, sand, and lots of goldens! Open to all playful dogs.',
    startTime: '2024-06-22T10:00:00',
    location: 'Sunny Beach, Miami',
    coverImageUrl: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?q=80&w=1974&auto=format&fit=crop',
    hostName: 'Goldie Lovers',
    interestedCount: 80,
    goingCount: 35,
    isOnline: false,
    category: 'Meetup'
  }
];

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title Section */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Events</h1>
              <p className="text-muted-foreground mt-1">Don&apos;t miss out on the fun! Browse upcoming pet events.</p>
            </div>
            <Button className="rounded-xl shadow-md hover:shadow-lg transition-all">
               <Plus className="w-5 h-5 mr-2" />
               Host an Event
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
                      placeholder="Find events..."
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
                      <SelectItem value="MEETUP">Meetups</SelectItem>
                      <SelectItem value="EDUCATION">Workshops</SelectItem>
                      <SelectItem value="COMPETITION">Competitions</SelectItem>
                      <SelectItem value="ACTIVITY">Activities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="mb-5">
                  <label className="text-sm font-bold text-muted-foreground mb-2 block">Location</label>
                  <Select value={city} onValueChange={(val) => setCity(val === 'ALL' ? '' : val)}>
                    <SelectTrigger className="rounded-xl bg-muted/30 border-transparent focus:bg-background">
                      <SelectValue placeholder="Everywhere" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Everywhere</SelectItem>
                      <SelectItem value="ONLINE">Online Only</SelectItem>
                      <SelectItem value="TPHCM">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="HANOI">Hà Nội</SelectItem>
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

               {/* Calendar Widget (Mini) */}
               <div className="bg-card rounded-2xl shadow-soft p-5 border border-border">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                     <CalendarIcon className="h-5 w-5 text-primary" />
                     Calendar
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                     <p className="text-sm text-muted-foreground italic">Calendar view coming soon!</p>
                  </div>
               </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
               {MOCK_EVENTS.length === 0 ? (
                <div className="bg-card rounded-2xl shadow-soft p-12 text-center border border-border dashed">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No events found</h3>
                  <p className="text-muted-foreground mb-6">Be the first to create an event!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {MOCK_EVENTS.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  <div className="text-center mt-10">
                    <Button variant="outline" className="rounded-xl px-8">
                      Load More Events
                    </Button>
                  </div>
                </>
              )}
            </main>
          </div>
      </div>
    </div>
  );
}
