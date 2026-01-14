'use client';

import { useState, useEffect } from 'react';
import activityService, { ActivityType, CreateActivityRequest } from '@/services/activityService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface CreateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    initialDate?: Date;
}

export default function CreateActivityModal({ isOpen, onClose, onCreated, initialDate }: CreateActivityModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ActivityType>(ActivityType.PLAY); // Default to 'Offline' -> PLAY
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [location, setLocation] = useState('');
    const [reminder, setReminder] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            if (initialDate) {
                setStartDate(initialDate.toISOString().split('T')[0]);
            } else {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
            }
        }
    }, [isOpen, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
            
            // Validate date is not in past
            if (new Date(`${startDate}T${startTime}:00`) < new Date()) {
                toast.error("Không thể tạo sự kiện trong quá khứ");
                setLoading(false);
                return;
            }

            // End time defaults to start time + 1 hour for now if not specified in UI
            // Or just same day
            const endDateTime = undefined; 

            const payload: CreateActivityRequest = {
                title,
                description,
                type,
                startTime: startDateTime,
                endTime: endDateTime,
                location,
                // petId - omitted in this design
                hasReminder: reminder
            };

            await activityService.createActivity(payload);
            toast.success("Đã tạo sự kiện thành công");
            onCreated();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
        } catch (error) {
            console.error("Failed to create activity", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    
    // Get today in YYYY-MM-DD format for min attribute
    const minDate = new Date().toISOString().split('T')[0];
    
    // Calculate min time if start date is today
    const now = new Date();
    const currentHHMM = now.toTimeString().slice(0, 5);
    const minTime = startDate === minDate ? currentHHMM : undefined;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300" role="dialog">
            {/* Blob Background - adapted from user styles */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-5 z-0" style={{
                backgroundImage: 'radial-gradient(#99e6bf 1px, transparent 1px), radial-gradient(#FFEB99 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }}></div>
            
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-custom-card-light dark:bg-custom-card-dark rounded-2xl shadow-soft-hover border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-fade-in-up flex flex-col max-h-[90vh]">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 z-30"
                >
                    <span className="material-symbols-outlined block">close</span>
                </button>
                
                <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-black text-custom-text-main dark:text-white flex items-center gap-3">
                        <div className="size-10 rounded-full bg-custom-primary/20 text-custom-primary-hover flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">event_note</span>
                        </div>
                        Thêm sự kiện mới
                    </h2>
                    <p className="text-custom-text-sub dark:text-gray-400 mt-2 ml-14">Lên kế hoạch vui chơi và chăm sóc cho thú cưng của bạn.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200" htmlFor="eventName">Tên sự kiện</label>
                        <input 
                            id="eventName"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-custom-bg-light dark:bg-gray-800 text-custom-text-main dark:text-white focus:ring-2 focus:ring-custom-primary focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                            placeholder="Ví dụ: Đi dạo công viên, Tiêm phòng..."
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200">Loại sự kiện</label>
                        <div className="flex flex-wrap gap-3">
                            <label className="cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="event_type" 
                                    className="peer sr-only"
                                    checked={type === ActivityType.PLAY}
                                    onChange={() => setType(ActivityType.PLAY)}
                                />
                                <div className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-custom-primary peer-checked:text-[#101914] peer-checked:border-custom-primary text-custom-text-sub dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">groups</span>
                                    <span className="font-semibold">Offline</span>
                                </div>
                            </label>
                            
                            <label className="cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="event_type" 
                                    className="peer sr-only"
                                    checked={type === ActivityType.MEDICAL}
                                    onChange={() => setType(ActivityType.MEDICAL)}
                                />
                                <div className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-custom-secondary peer-checked:text-[#101914] peer-checked:border-custom-secondary text-custom-text-sub dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">medical_services</span>
                                    <span className="font-semibold">Khám bệnh</span>
                                </div>
                            </label>
                            
                            <label className="cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="event_type" 
                                    className="peer sr-only"
                                    checked={type === ActivityType.BIRTHDAY}
                                    onChange={() => setType(ActivityType.BIRTHDAY)}
                                />
                                <div className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-pink-300 peer-checked:text-[#101914] peer-checked:border-pink-300 text-custom-text-sub dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">cake</span>
                                    <span className="font-semibold">Sinh nhật</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200">Ngày diễn ra</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    min={minDate}
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-custom-bg-light dark:bg-gray-800 text-custom-text-main dark:text-white focus:ring-2 focus:ring-custom-primary focus:border-transparent transition-all outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200">Giờ bắt đầu</label>
                            <div className="relative">
                                <input 
                                    type="time" 
                                    min={minTime}
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-custom-bg-light dark:bg-gray-800 text-custom-text-main dark:text-white focus:ring-2 focus:ring-custom-primary focus:border-transparent transition-all outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200">Địa điểm</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-custom-primary transition-colors">
                                <span className="material-symbols-outlined">location_on</span>
                            </span>
                            <input 
                                type="text" 
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="w-full pl-11 pr-12 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-custom-bg-light dark:bg-gray-800 text-custom-text-main dark:text-white focus:ring-2 focus:ring-custom-primary focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                                placeholder="Tìm kiếm địa chỉ..."
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-custom-primary hover:bg-custom-primary/10 rounded-md transition-colors" title="Vị trí hiện tại">
                                <span className="material-symbols-outlined text-[20px]">my_location</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200">Mô tả chi tiết</label>
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-custom-bg-light dark:bg-gray-800 text-custom-text-main dark:text-white focus:ring-2 focus:ring-custom-primary focus:border-transparent transition-all outline-none resize-none placeholder:text-gray-400"
                            placeholder="Ghi chú thêm về sự kiện (trang phục, đồ ăn mang theo...)"
                            rows={3}
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <div className="relative flex items-center">
                            <input 
                                id="reminder" 
                                type="checkbox" 
                                checked={reminder}
                                onChange={e => setReminder(e.target.checked)}
                                className="peer size-5 appearance-none border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 checked:bg-custom-primary checked:border-custom-primary transition-all cursor-pointer"
                            />
                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-50 peer-checked:scale-100 transition-transform">
                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                            </span>
                        </div>
                        <label htmlFor="reminder" className="text-sm font-medium text-custom-text-main dark:text-gray-300 cursor-pointer select-none">
                            Nhắc nhở tôi trước 30 phút
                        </label>
                    </div>

                    <div className="px-8 py-6 -mx-8 -mb-8 bg-gray-50 dark:bg-gray-800/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 rounded-lg text-custom-text-sub dark:text-gray-400 font-bold hover:bg-gray-200/50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-custom-primary hover:bg-custom-primary-hover text-[#101914] font-bold shadow-soft hover:shadow-soft-hover transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:scale-100"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">save</span>
                            )}
                            Lưu sự kiện
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
