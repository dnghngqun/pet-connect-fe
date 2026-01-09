'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import PetHealthProfile from './pet-health-profile';
import type { PetProfile } from '@/lib/types';
import { Heart, BookOpen } from 'lucide-react';

// Flexible pet type to accept various pet data structures
interface PetWithHealthRecord {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  photos?: string[];
  personality?: string[];
  healthRecord?: {
    id?: string;
    vaccinations?: { name: string; date: string; nextDue?: string }[];
    medicalHistory?: { date: string; condition: string; treatment: string; notes?: string }[];
    weight?: { date: string; value: number }[];
    lastCheckup?: string;
    allergies?: string[];
    notes?: string;
  };
}

interface PetHealthProfileDialogProps {
  pet: PetWithHealthRecord;
}

export default function PetHealthProfileDialog({ pet }: PetHealthProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Transform to PetProfile format for inner component
  const petProfile: PetProfile = {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    gender: pet.gender,
    weight: pet.weight,
    photos: pet.photos || [],
    personality: pet.personality || [],
    healthRecord: {
      id: pet.healthRecord?.id || '',
      vaccinations: pet.healthRecord?.vaccinations || [],
      medicalHistory: pet.healthRecord?.medicalHistory || [],
      weight: pet.healthRecord?.weight || [],
      lastCheckup: pet.healthRecord?.lastCheckup || new Date().toISOString(),
      allergies: pet.healthRecord?.allergies || [],
      notes: pet.healthRecord?.notes,
    },
  };

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
            <PetHealthProfile pet={petProfile} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

