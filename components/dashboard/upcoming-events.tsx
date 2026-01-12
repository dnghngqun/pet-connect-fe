'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import eventService, { Event } from '@/services/eventService';
import { format } from 'date-fns';

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getUpcomingEvents(0, 5);
      if (response.success && response.data?.content) {
        setEvents(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5 animate-pulse min-h-[200px]" />
    );
  }

  return (
    <div className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1b110d] dark:text-white text-lg">Sự kiện sắp tới</h3>
        <a className="text-xs font-bold text-[#f06e42] hover:underline" href="#">Xem tất cả</a>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có sự kiện nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 group cursor-pointer">
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#f06e42]/10 dark:bg-[#f06e42]/20 rounded-xl shrink-0 text-[#f06e42]">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {format(new Date(event.startAt), 'MMM')}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(new Date(event.startAt), 'dd')}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-[#1b110d] dark:text-white text-sm group-hover:text-[#f06e42] transition-colors leading-tight line-clamp-1">
                  {event.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {format(new Date(event.startAt), 'h:mm a')} • {event.location || event.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
