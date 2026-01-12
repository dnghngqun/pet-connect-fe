'use client';

interface PetProfileCardProps {
  pet: any;
}

export default function PetProfileCard({ pet }: PetProfileCardProps) {
  if (!pet) return null;

  return (
    <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-6 flex flex-col items-center text-center relative overflow-hidden group">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#C9E0ED]/40 to-transparent"></div>

      {/* Avatar */}
      <div className="relative z-10 w-28 h-28 rounded-full p-1 bg-white dark:bg-[#232329] shadow-sm mb-4 transition-transform group-hover:scale-105 duration-300">
        <div
          className="w-full h-full rounded-full bg-cover bg-center"
          style={{
            backgroundImage: pet.profilePhoto
              ? `url('${pet.profilePhoto}')`
              : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200)',
          }}
        />
        <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-[#232329]" title="Online"></div>
      </div>

      {/* Pet Info */}
      <h2 className="text-2xl font-bold text-[#1b110d] dark:text-white mb-1">{pet.name}</h2>
      <p className="text-[#f06e42] font-medium text-sm mb-3">
        {pet.type} • {pet.age} tháng tuổi
      </p>

      {/* Bio */}
      {pet.bio && (
        <div className="bg-[#fcf9f8] dark:bg-white/5 rounded-xl p-3 w-full mb-4">
          <p className="text-[#9a5f4c] dark:text-gray-400 text-sm leading-relaxed">{pet.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex w-full gap-2">
        <div className="flex-1 flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
          <span className="font-bold text-lg text-[#1b110d] dark:text-white">{pet.followerCount || 0}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Người theo dõi</span>
        </div>
        <div className="w-px bg-gray-100 dark:bg-white/10"></div>
        <div className="flex-1 flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
          <span className="font-bold text-lg text-[#1b110d] dark:text-white">0</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Bài viết</span>
        </div>
      </div>
    </div>
  );
}
