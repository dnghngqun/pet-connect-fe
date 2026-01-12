import Link from 'next/link';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Assuming we will have an Event type later, using 'any' for now to speed up implementation
// or defining a minimal interface here.
export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location: string;
  coverImageUrl?: string;
  hostName: string;
  hostAvatar?: string;
  interestedCount: number;
  goingCount: number;
  isOnline: boolean;
  category: string;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startTime);
  const day = startDate.getDate();
  const month = startDate.toLocaleString('default', { month: 'short' });

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-soft-lg transition-all duration-300 cursor-pointer h-full border-border rounded-2xl overflow-hidden group">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Cover Image */}
          <div className="relative h-40 bg-gray-100 overflow-hidden">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-purple-50">
                <Calendar className="h-12 w-12 text-indigo-300" />
              </div>
            )}
            
            {/* Date Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-2 text-center shadow-sm min-w-[3.5rem]">
               <span className="block text-xs font-bold text-red-500 uppercase tracking-wider">{month}</span>
               <span className="block text-xl font-extrabold text-foreground leading-none">{day}</span>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
               <Badge className="bg-black/50 hover:bg-black/60 backdrop-blur-md text-white border-0">
                  {event.category}
               </Badge>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="space-y-2 mb-4 flex-1">
               <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Clock className="w-4 h-4 text-primary/70 shrink-0" />
                  <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                  <span className="truncate">{event.location}</span>
               </div>
               <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Users className="w-4 h-4 text-primary/70 shrink-0" />
                  <span>{event.interestedCount + event.goingCount} interested</span>
               </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${event.hostAvatar}')` }}></div>
                   <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">{event.hostName}</span>
                </div>
                <Button variant="secondary" size="sm" className="h-8 rounded-lg font-bold text-xs">
                   Interested
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
