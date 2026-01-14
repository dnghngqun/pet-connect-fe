import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pet } from "@/services/petService";
import { useState } from "react";

interface PetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onConfirm: (petId: number) => void;
  title: string;
  loading?: boolean;
}

export default function PetSelectionModal({
  isOpen,
  onClose,
  pets,
  onConfirm,
  title,
  loading = false,
}: PetSelectionModalProps) {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedPetId) {
      onConfirm(selectedPetId);
      // Reset after confirming
      // setSelectedPetId(null); // Optional, maybe parent closes modal
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#1d0e0c]">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-[#a14d45] mb-4">
            Chọn thú cưng bạn muốn sử dụng để thực hiện hành động này:
          </p>
          
          {pets.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <p className="text-[#a14d45] mb-2">Bạn chưa có thú cưng nào</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/pets/create'}
                className="text-[#ff7366] border-[#ff7366] hover:bg-[#ff7366]/10"
              >
                Thêm thú cưng ngay
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                    selectedPetId === pet.id
                      ? 'border-[#ff7366] bg-[#ff7366]/5 shadow-md'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 ring-1 ring-inset ring-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full bg-cover bg-center bg-gray-200 shrink-0"
                      style={{ backgroundImage: pet.profilePhoto ? `url("${pet.profilePhoto}")` : undefined }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#1d0e0c] truncate text-sm">{pet.name}</p>
                      <p className="text-xs text-[#a14d45] truncate">{pet.breed || pet.species}</p>
                    </div>
                    {selectedPetId === pet.id && (
                      <span className="material-symbols-outlined text-[#ff7366] text-[20px] ml-auto">check_circle</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedPetId || loading}
            className="bg-[#ff7366] hover:bg-[#e6685c] text-white"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2" />
            ) : null}
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
