'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (settings: any) => void;
}

export default function ReminderModal({ isOpen, onClose, onConfirm }: ReminderModalProps) {
    const { user } = useAuth();
    const [reminderTime, setReminderTime] = useState('30 phút trước khi bắt đầu');
    const [methods, setMethods] = useState({
        browser: true,
        email: true
    });
    const [emailAddress, setEmailAddress] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen && user?.email) {
            setEmailAddress(user.email);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({ reminderTime, methods, emailAddress, note });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-0">
            <div className="absolute inset-0 bg-[#101914]/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-custom-card-dark rounded-2xl shadow-soft-hover max-w-md w-full transform transition-all overflow-hidden border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s_ease-out]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-custom-primary/10 to-transparent">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-custom-primary text-[24px]">notifications_active</span>
                        <h3 className="text-lg font-extrabold text-custom-text-main dark:text-white">Thiết lập nhắc nhở</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-custom-text-sub hover:text-custom-text-main dark:text-gray-400 dark:hover:text-white transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200 mb-2">Thời gian nhắc trước</label>
                        <div className="relative group">
                            <select 
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent group-hover:border-custom-primary/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-custom-primary focus:border-custom-primary text-custom-text-main dark:text-white appearance-none transition-all cursor-pointer outline-none"
                            >
                                <option>5 phút trước khi bắt đầu</option>
                                <option>15 phút trước khi bắt đầu</option>
                                <option>30 phút trước khi bắt đầu</option>
                                <option>1 giờ trước khi bắt đầu</option>
                                <option>1 ngày trước khi bắt đầu</option>
                            </select>
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-custom-primary text-[20px]">schedule</span>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-custom-text-sub text-[20px] pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200 mb-2">Phương thức nhận thông báo</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <input 
                                    type="checkbox" 
                                    checked={methods.browser}
                                    onChange={(e) => setMethods({...methods, browser: e.target.checked})}
                                    className="size-5 rounded text-custom-primary focus:ring-custom-primary border-gray-300 bg-white" 
                                />
                                <div className="flex items-center gap-2 text-sm font-medium text-custom-text-main dark:text-gray-300 group-hover:text-custom-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-custom-text-sub group-hover:text-custom-primary">desktop_windows</span>
                                    Thông báo trên trình duyệt
                                </div>
                            </label>
                            
                            <div className={`p-3 border border-gray-100 dark:border-gray-700 rounded-xl transition-colors ${methods.email ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <label className="flex items-center gap-3 cursor-pointer group mb-2">
                                    <input 
                                        type="checkbox" 
                                        checked={methods.email}
                                        onChange={(e) => setMethods({...methods, email: e.target.checked})}
                                        className="size-5 rounded text-custom-primary focus:ring-custom-primary border-gray-300 bg-white" 
                                    />
                                    <div className="flex items-center gap-2 text-sm font-medium text-custom-text-main dark:text-gray-300 group-hover:text-custom-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px] text-custom-text-sub group-hover:text-custom-primary">mail</span>
                                        Gửi Email
                                    </div>
                                </label>
                                
                                {methods.email && (
                                    <div className="pl-8 animate-fade-in-up">
                                        <input 
                                            type="email" 
                                            value={emailAddress}
                                            onChange={(e) => setEmailAddress(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-1 focus:ring-custom-primary focus:border-custom-primary outline-none text-custom-text-main dark:text-white"
                                            placeholder="Nhập địa chỉ email..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-custom-text-main dark:text-gray-200 mb-2">Ghi chú (Tùy chọn)</label>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm font-medium focus:ring-2 focus:ring-custom-primary text-custom-text-main dark:text-white resize-none h-24 placeholder-gray-400 transition-all outline-none" 
                            placeholder="Nhập ghi chú ngắn cho lời nhắc..."
                        ></textarea>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">

                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-custom-text-sub hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-all"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-custom-primary hover:bg-custom-primary-hover text-[#101914] shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
