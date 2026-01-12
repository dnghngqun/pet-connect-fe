'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import petService from '@/services/petService';

interface PetSwitcherCardProps {
  currentPet: any;
}

export default function PetSwitcherCard({ currentPet }: PetSwitcherCardProps) {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await petService.getMyPets();
        if (response.success && Array.isArray(response.data)) {
          setPets(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch pets for switcher:', error);
      }
    };
    fetchPets();
  }, []);

  const handleSwitchPet = (pet: any) => {
    localStorage.setItem('selected-pet-id', pet.id.toString());
    localStorage.setItem('current-pet', JSON.stringify(pet));
    window.location.reload(); // Reload to refresh global state/context
  };

  // Filter out current pet from list to show "switchable" pets
  // Or show all, with current marked as active. Design shows current active top, then others?
  // User HTML:
  // Active div: "Buddy - Đang hoạt động" with check_circle
  // List of buttons for others.
  
  const otherPets = pets.filter(p => p.id !== currentPet?.id);

  return (
    <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-[#f3eae7] dark:border-white/5">
        <h3 className="font-bold text-[#1b110d] dark:text-white text-sm uppercase tracking-wider">
          Chuyển hồ sơ
        </h3>
      </div>
      <div className="p-2 space-y-1">
        {/* Active Pet */}
        {currentPet && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f06e42]/10 border border-[#f06e42]/20 cursor-default">
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: currentPet.profilePhoto
                  ? `url('${currentPet.profilePhoto}')`
                  : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1b110d] dark:text-white truncate">{currentPet.name}</p>
              <p className="text-xs text-[#f06e42] truncate">Đang hoạt động</p>
            </div>
            <span className="material-symbols-outlined text-[#f06e42] text-[20px]">check_circle</span>
          </div>
        )}

        {/* Other Pets */}
        {otherPets.map(pet => (
          <button
            key={pet.id}
            onClick={() => handleSwitchPet(pet)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group text-left"
          >
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all"
              style={{
                backgroundImage: pet.profilePhoto
                  ? `url('${pet.profilePhoto}')`
                  : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1b110d] dark:text-gray-200 truncate group-hover:text-[#f06e42] transition-colors">
                {pet.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{pet.breed || pet.species}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 text-[20px]">login</span>
          </button>
        ))}

        {/* Add New Pet */}
        <button
          onClick={() => router.push('/select-pet')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left text-gray-500 dark:text-gray-400"
        >
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <span className="text-sm font-medium">Thêm thú cưng khác</span>
        </button>
      </div>
    </div>
  );
}
