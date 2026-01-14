'use client';

import { useState, useEffect } from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    isToday,
    parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';
import activityService, { ActivityDTO, ActivityType } from '@/services/activityService';
import CreateActivityModal from '@/components/calendar/create-activity-modal';
import apiClient from '@/common/apiClient';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/common/confirm-modal';
import ReminderModal from '@/components/calendar/reminder-modal';


export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activities, setActivities] = useState<ActivityDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

    // Fetch activities when month changes
    useEffect(() => {
        fetchActivities();
    }, [currentDate]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await activityService.getActivities(
                currentDate.getMonth() + 1,
                currentDate.getFullYear()
            );
            if (res.success) {
                setActivities(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate)),
        end: endOfWeek(endOfMonth(currentDate))
    });

    const selectedDateActivities = activities.filter(act => 
        isSameDay(parseISO(act.startTime), selectedDate)
    );

    const upcomingActivities = activities.filter(act => 
        new Date(act.startTime) >= new Date()
    ).slice(0, 3); // Top 3 upcoming

    const getActivityColor = (type: ActivityType) => {
        switch (type) {
            case ActivityType.MEDICAL: return 'bg-blue-100 text-blue-700 border-event-medical dark:bg-blue-900/30 dark:text-blue-300';
            case ActivityType.VACCINATION: return 'bg-blue-100 text-blue-700 border-event-medical dark:bg-blue-900/30 dark:text-blue-300';
            case ActivityType.DEWORMING: return 'bg-blue-100 text-blue-700 border-event-medical dark:bg-blue-900/30 dark:text-blue-300';
            case ActivityType.PLAY: return 'bg-orange-100 text-orange-700 border-event-play dark:bg-orange-900/30 dark:text-orange-300';
            case ActivityType.BIRTHDAY: return 'bg-red-100 text-red-700 border-event-birthday dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-400 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getBorderColor = (type: ActivityType) => {
        switch (type) {
            case ActivityType.MEDICAL: 
            case ActivityType.VACCINATION: 
            case ActivityType.DEWORMING: return 'border-event-medical';
            case ActivityType.PLAY: return 'border-event-play';
            case ActivityType.BIRTHDAY: return 'border-event-birthday';
            default: return 'border-gray-400';
        }
    };

    const getTypeLabel = (type: ActivityType) => {
         switch (type) {
            case ActivityType.MEDICAL: return 'Y tế';
            case ActivityType.VACCINATION: return 'Tiêm phòng';
            case ActivityType.DEWORMING: return 'Tẩy giun';
            case ActivityType.PLAY: return 'Vui chơi';
            case ActivityType.BIRTHDAY: return 'Sinh nhật';
            default: return 'Khác';
        }
    };

    return (
        <main className="flex-1 px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 shrink-0">
                <div>
                    <h1 className="text-[#101914] dark:text-white text-3xl font-black leading-tight tracking-tight mb-2">
                        Lịch Hoạt Động
                    </h1>
                    <p className="text-[#578e73] dark:text-gray-400">Quản lý lịch trình vui chơi và chăm sóc sức khỏe cho thú cưng.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white dark:bg-[#2c363f] rounded-lg p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                        <button onClick={prevMonth} className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-[#578e73] dark:text-gray-300">
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <div className="px-4 py-1.5 font-bold text-[#101914] dark:text-white min-w-[140px] text-center capitalize">
                            {format(currentDate, 'MMMM, yyyy', { locale: vi })}
                        </div>
                        <button onClick={nextMonth} className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-[#578e73] dark:text-gray-300">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-[#101914] font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-soft hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span className="hidden sm:inline">Thêm sự kiện</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
                {/* Calendar Grid */}
                <div className="lg:col-span-8 bg-white dark:bg-[#2c363f] rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
                    <div className="grid grid-cols-7 mb-4 shrink-0">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                            <div key={day} className="text-center text-sm font-bold text-[#578e73] dark:text-gray-400 py-2">{day}</div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 lg:gap-4 auto-rows-fr overflow-y-auto flex-1 custom-scrollbar">
                        {daysInMonth.map((day, idx) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayActivities = activities.filter(act => 
                                isSameDay(parseISO(act.startTime), day)
                            );
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div 
                                    key={dateKey}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        min-h-[100px] p-2 rounded-lg border transition-all flex flex-col items-start justify-start relative cursor-pointer group
                                        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/30 text-gray-300 dark:text-gray-600 border-transparent' : 
                                            isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 dark:ring-offset-[#2c363f]' : 
                                            'bg-white dark:bg-transparent border-transparent hover:border-primary/50 hover:bg-primary/5'}
                                    `}
                                >
                                    <span className={`text-sm font-semibold mb-1 ${isTodayDate ? 'bg-primary text-[#101914] w-6 h-6 rounded-full flex items-center justify-center' : 'text-[#578e73] dark:text-gray-400'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    {/* Event Dots/Bars */}
                                    <div className="w-full space-y-1 mt-1 overflow-hidden">
                                        {dayActivities.slice(0, 3).map(act => (
                                            <div 
                                                key={act.id}
                                                className={`w-full px-2 py-0.5 text-[10px] font-bold rounded truncate border-l-2 ${getActivityColor(act.type)}`}
                                                title={act.title}
                                            >
                                                {act.title}
                                            </div>
                                        ))}
                                        {dayActivities.length > 3 && (
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                +{dayActivities.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white dark:bg-[#2c363f] rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-[#101914] dark:text-white capitalize">
                                    {format(selectedDate, 'EEEE, d MMMM', { locale: vi })}
                                </h3>
                                <p className="text-sm text-[#578e73] dark:text-gray-400">{selectedDateActivities.length} sự kiện đã lên lịch</p>
                            </div>
                            <div className="bg-primary/20 text-[#578e73] dark:text-primary rounded-lg p-2">
                                <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                            </div>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                            {selectedDateActivities.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30">event_busy</span>
                                    <p>Không có sự kiện nào</p>
                                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-primary font-bold text-sm hover:underline">Thêm sự kiện</button>
                                </div>
                            ) : (
                                selectedDateActivities.map(act => (
                                    <div key={act.id} className={`relative pl-4 border-l-4 ${getBorderColor(act.type)} hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-r-lg transition-colors cursor-pointer group`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wide ${act.type === ActivityType.PLAY ? 'text-orange-600' : 'text-blue-600'}`}>
                                                {getTypeLabel(act.type)}
                                            </span>
                                            <span className="text-xs text-[#578e73] dark:text-gray-500">
                                                {format(parseISO(act.startTime), 'HH:mm')}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-[#101914] dark:text-white mb-1 group-hover:text-primary-hover transition-colors">
                                            {act.title}
                                        </h4>
                                        
                                        {act.petName && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div 
                                                    className="size-6 bg-center bg-no-repeat bg-cover rounded-full border border-white dark:border-gray-600" 
                                                    style={{ backgroundImage: `url('${act.petAvatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}')` }}
                                                ></div>
                                                <span className="text-xs text-[#578e73] dark:text-gray-400">{act.petName} tham gia</span>
                                            </div>
                                        )}
                                        
                                        {act.description && (
                                            <p className="text-sm text-[#578e73] dark:text-gray-400 line-clamp-2">{act.description}</p>
                                        )}
                                        
                                        <div className="mt-3 flex gap-2">
                                            <button 
                                                className="flex items-center gap-1.5 text-xs font-bold text-[#578e73]/80 dark:text-gray-400 hover:text-primary transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedActivityId(act.id);
                                                    setIsReminderModalOpen(true);
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">notifications</span>
                                                Đặt nhắc nhở
                                            </button>
                                            <button 
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-500/80 hover:text-red-600 transition-colors ml-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActivityToDelete(act.id);
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Upcoming Section (Optional) */}
                        {upcomingActivities.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                                <h4 className="text-sm font-bold text-[#101914] dark:text-white mb-3">Sắp diễn ra</h4>
                                <div className="space-y-3">
                                {upcomingActivities.map(act => (
                                    <div key={'up-'+act.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="bg-white dark:bg-[#2c363f] rounded p-2 shadow-sm text-center min-w-[50px]">
                                            <span className="block text-xs font-bold text-red-500 uppercase">Th.{format(parseISO(act.startTime), 'M')}</span>
                                            <span className="block text-xl font-black text-[#101914] dark:text-white">{format(parseISO(act.startTime), 'd')}</span>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-[#101914] dark:text-white text-sm line-clamp-1">{act.title}</h5>
                                            <p className="text-xs text-[#578e73] dark:text-gray-400">{getTypeLabel(act.type)}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}

                    </div>
                    
                    {/* Legend */}
                    <div className="bg-white dark:bg-[#2c363f] rounded-xl shadow-soft p-4 border border-gray-100 dark:border-gray-700 shrink-0">
                        <h4 className="text-sm font-bold text-[#101914] dark:text-white mb-3">Phân loại</h4>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-[#578e73] dark:text-gray-400">Y tế</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-orange-500"></div>
                                <span className="text-xs text-[#578e73] dark:text-gray-400">Vui chơi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-[#578e73] dark:text-gray-400">Sinh nhật</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateActivityModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreated={fetchActivities}
                initialDate={selectedDate}
            />

            <ReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                onConfirm={(settings) => {
                    console.log("Reminder settings for activity", selectedActivityId, settings);
                    // Here we can call backend to save settings if needed
                    // For now just close
                    setIsReminderModalOpen(false);
                    // Maybe show toast? "Đã lưu nhắc nhở"
                    toast.success("Đã lưu cài đặt nhắc nhở");
                }}
            />

            <ConfirmModal 
                isOpen={!!activityToDelete}
                onClose={() => setActivityToDelete(null)}
                onConfirm={async () => {
                    if (activityToDelete) {
                        try {
                            const res = await activityService.deleteActivity(activityToDelete);
                            if (res.success) {
                                toast.success('Đã xóa sự kiện');
                                fetchActivities();
                            } else {
                                toast.error('Có lỗi xảy ra khi xóa sự kiện');
                            }
                        } catch (error) {
                            toast.error('Có lỗi xảy ra');
                        }
                    }
                }}
                title="Xóa sự kiện"
                message="Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
                confirmText="Xóa sự kiện"
                isDestructive={true}
            />
        </main>
    );
}


