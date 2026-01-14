'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import groupService, { Group } from '@/services/groupService';

interface MyGroupsProps {
  petId?: number;
}

export default function MyGroups({ petId: propPetId }: MyGroupsProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [petId, setPetId] = useState<number | null>(propPetId || null);

  useEffect(() => {
    // Get petId from localStorage if not provided as prop
    if (!propPetId && typeof window !== 'undefined') {
      const storedPet = localStorage.getItem('current-pet');
      if (storedPet) {
        try {
          const pet = JSON.parse(storedPet);
          setPetId(pet.id);
        } catch (e) {}
      }
    }
  }, [propPetId]);

  useEffect(() => {
    if (petId) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [petId]);

  const fetchGroups = async () => {
    if (!petId) return;
    try {
      const response = await groupService.getMyGroups(petId, 0, 8);
      if (response && response.content) {
        setGroups(response.content);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5 animate-pulse min-h-[150px]" />
    );
  }

  return (
    <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1b110d] dark:text-white text-lg">Nhóm của tôi</h3>
        <button className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa tham gia nhóm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col items-center gap-1 group cursor-pointer" title={group.name}>
              <div 
                className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-transparent group-hover:border-[#f06e42] transition-all duration-300"
                style={{
                  backgroundImage: group.avatarUrl 
                    ? `url('${group.avatarUrl}')` 
                    : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)'
                }}
              />
              <span className="text-[10px] font-medium text-center truncate w-full text-gray-600 dark:text-gray-300">
                {group.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
