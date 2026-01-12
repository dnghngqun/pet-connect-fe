'use client';

import { useState } from 'react';
import CreatePostModal from './create-post-modal';

interface PostComposerProps {
  pet: any;
  onPostCreated?: () => void;
}

export default function PostComposer({ pet, onPostCreated }: PostComposerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine action verb based on species
  const getActionVerb = (species: string) => {
    const s = species?.toLowerCase() || '';
    if (s.includes('dog') || s.includes('chó') || s.includes('cún')) return 'gâu';
    if (s.includes('cat') || s.includes('mèo') || s.includes('miu')) return 'meo';
    return 'kêu';
  };

  const actionVerb = pet ? getActionVerb(pet.species || pet.type) : 'kêu';

  if (!pet) return null;

  return (
    <>
      <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-4 sm:p-5 mb-6">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div
              className="w-12 h-12 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: pet.profilePhoto
                  ? `url('${pet.profilePhoto}')`
                  : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
              }}
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <div className="w-full bg-[#fcf9f8] dark:bg-black/20 border-none rounded-xl p-3 text-gray-500 dark:text-gray-400 min-h-[50px] flex items-center">
              Hôm nay {pet.name} muốn {actionVerb} về chuyện gì?
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                <button
                  className="p-2 text-[#9a5f4c] dark:text-gray-400 hover:bg-[#f3eae7] dark:hover:bg-white/5 rounded-lg transition-colors"
                  title="Thêm ảnh"
                >
                  <span className="material-symbols-outlined text-[22px]">image</span>
                </button>
                <button
                  className="p-2 text-[#9a5f4c] dark:text-gray-400 hover:bg-[#f3eae7] dark:hover:bg-white/5 rounded-lg transition-colors"
                  title="Thêm video"
                >
                  <span className="material-symbols-outlined text-[22px]">videocam</span>
                </button>
                <button
                  className="p-2 text-[#9a5f4c] dark:text-gray-400 hover:bg-[#f3eae7] dark:hover:bg-white/5 rounded-lg transition-colors hidden sm:block"
                  title="Vị trí"
                >
                  <span className="material-symbols-outlined text-[22px]">location_on</span>
                </button>
              </div>
              
              <button
                className="bg-[#f06e42] hover:bg-[#f06e42]/90 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                Đăng
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pet={pet}
        onPostCreated={onPostCreated}
      />
    </>
  );
}
