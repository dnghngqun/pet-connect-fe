"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import petService, { Pet } from "@/services/petService";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface PetSelectorProps {
  open: boolean;
  onSelect: (pet: Pet) => void;
  userId: number;
}

export default function PetSelector({ open, onSelect, userId }: PetSelectorProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (open && userId) {
      loadPets();
    }
  }, [open, userId]);

  const loadPets = async () => {
    setLoading(true);
    const result = await petService.getMyPets();
    if (result.success && Array.isArray(result.data)) {
      setPets(result.data);
    }
    setLoading(false);
  };

  const handleCreatePet = () => {
     router.push("/onboarding");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-orange-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-orange-600">Chọn thú cưng của bạn</DialogTitle>
          <DialogDescription className="text-center">
            Bạn muốn trải nghiệm PetConnect với tư cách là ai?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
             </div>
          ) : pets.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {pets.map((pet) => (
                <motion.button
                  key={pet.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(pet)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 transition-all gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-200 group-hover:border-orange-500">
                    <img 
                        src={pet.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.name}`} 
                        alt={pet.name}
                        className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-orange-600 truncate max-w-full px-2">
                    {pet.name}
                  </span>
                </motion.button>
              ))}
              
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleCreatePet}
                 className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all gap-2 text-gray-500 hover:text-orange-500"
              >
                 <PlusCircle className="w-10 h-10" />
                 <span className="font-medium">Thêm bé mới</span>
              </motion.button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
                <p className="text-gray-500">Bạn chưa có thú cưng nào.</p>
                <Button onClick={handleCreatePet} className="bg-orange-500 hover:bg-orange-600">
                    <PlusCircle className="mr-2 w-4 h-4" /> Tạo thú cưng ngay
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
