'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PetProfileCard from '@/components/dashboard/pet-profile-card';
import PetSwitcherCard from '@/components/dashboard/pet-switcher-card';
import PostComposer from '@/components/dashboard/post-composer';
import FeedList from '@/components/dashboard/feed-list';
import UpcomingEvents from '@/components/dashboard/upcoming-events';
import MyGroups from '@/components/dashboard/my-groups';
import PetSuggestions from '@/components/dashboard/pet-suggestions';
import petService from '@/services/petService';

export default function DashboardPage() {
  const router = useRouter();
  const [currentPet, setCurrentPet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedKey, setFeedKey] = useState(0); 

  useEffect(() => {
    const fetchCurrentPet = async () => {
      if (typeof window !== 'undefined') {
        const selectedPetId = localStorage.getItem('selected-pet-id');
        if (!selectedPetId) {
          window.location.href = '/select-pet';
          return;
        }

        const storedPet = localStorage.getItem('current-pet');
        if (storedPet) {
          setCurrentPet(JSON.parse(storedPet));
        }

        try {
           const response = await petService.getPetById(Number(selectedPetId));
           if (response.success && response.data) {
             const freshPet = response.data;
             setCurrentPet(freshPet);
             localStorage.setItem('current-pet', JSON.stringify(freshPet));
           }
        } catch (error) {
            console.error("Failed to refresh pet data", error);
        }
        setIsLoading(false);
      }
    };
    fetchCurrentPet();
  }, []);

  const handlePostCreated = () => {
    setFeedKey(prev => prev + 1); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8] dark:bg-[#19191f]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f06e42] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-6 hidden lg:block">
          <PetProfileCard pet={currentPet} />
          <PetSwitcherCard currentPet={currentPet} />
        </aside>

        {/* Middle Column */}
        <section className="lg:col-span-6 space-y-6">
          <div className="lg:hidden space-y-6 mb-6">
             <PetProfileCard pet={currentPet} />
             <PetSwitcherCard currentPet={currentPet} />
          </div>
          
          <PostComposer pet={currentPet} onPostCreated={handlePostCreated} />
          
          <div className="flex justify-center py-2">
            {/* Feed List Container */}
            <div className="w-full">
              <FeedList key={feedKey} currentPetId={currentPet?.id} />
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden xl:block xl:col-span-3 space-y-6 lg:sticky lg:top-24">
          <UpcomingEvents />
          <MyGroups petId={currentPet?.id} />
          <PetSuggestions currentPetId={currentPet?.id} />
        </aside>
      </div>
    </div>
  );
}

