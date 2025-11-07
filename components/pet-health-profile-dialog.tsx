'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import PetHealthProfile from './pet-health-profile';
import type { PetProfile } from '@/lib/types';
import { Heart, BookOpen } from 'lucide-react';

interface PetHealthProfileDialogProps {
  pet: PetProfile;
}

export default function PetHealthProfileDialog({ pet }: PetHealthProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Heart className="h-4 w-4 mr-2" />
          Xem hồ sơ y tế
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Hồ sơ y tế - {pet.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-100px)] pr-4">
          <div className="pr-4">
            <PetHealthProfile pet={pet} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

