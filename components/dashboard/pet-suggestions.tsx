'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import petService from '@/services/petService';

interface SuggestedPet {
  id: number;
  name: string;
  profilePhoto?: string;
  breed?: string;
  type?: string;
}

interface PetSuggestionsProps {
  currentPetId?: number;
}

export default function PetSuggestions({ currentPetId }: PetSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [currentPetId]);

  const fetchSuggestions = async () => {
    try {
      // Get all pets and filter out current pet
      const response = await petService.getPets({ page: 0, size: 10 });
      if (response.success && response.data?.content) {
        const allPets = response.data.content;
        // Filter out current pet and limit to 5
        const filtered = allPets
          .filter((pet: any) => pet.id !== currentPetId)
          .slice(0, 5);
        setSuggestions(filtered);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5 animate-pulse min-h-[100px]" />
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show if no suggestions
  }

  return (
    <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5">
      <h3 className="font-bold text-[#1b110d] dark:text-white text-sm uppercase tracking-wider mb-4">Có thể bạn biết</h3>
      <div className="space-y-3">
        {suggestions.map((pet) => (
          <div key={pet.id} className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200" 
              style={{backgroundImage: `url('${pet.profilePhoto || 'https://images.unsplash.com/photo-1629740032638-58bfd37fa201?w=100'}')`}}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1b110d] dark:text-white truncate">{pet.name}</p>
              <p className="text-xs text-gray-400 truncate">{pet.breed || pet.type}</p>
            </div>
            <a 
              href={`/pets/${pet.id}/profile`}
              className="text-[#f06e42] hover:bg-[#f06e42]/10 p-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
