'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import uploadService from '@/services/uploadService';
import medicalRecordService, { MedicalRecordDTO, UpdateMedicalRecordRequest, RecordType } from '@/services/medicalRecordService';

interface EditMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    record: MedicalRecordDTO;
}

export default function EditMedicalRecordModal({ isOpen, onClose, onSuccess, record }: EditMedicalRecordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState(record.diagnosis);
    const [recordType, setRecordType] = useState<RecordType>(record.type);
    const [date, setDate] = useState(record.date);
    const [clinicName, setClinicName] = useState(record.clinicName || '');
    const [doctorName, setDoctorName] = useState(record.doctorName || '');
    const [notes, setNotes] = useState(record.notes || '');
    const [existingAttachments, setExistingAttachments] = useState<string[]>(record.attachments || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && record) {
            setDiagnosis(record.diagnosis);
            setRecordType(record.type);
            setDate(record.date);
            setClinicName(record.clinicName || '');
            setDoctorName(record.doctorName || '');
            setNotes(record.notes || '');
            setExistingAttachments(record.attachments || []);
            setNewFiles([]);
        }
    }, [isOpen, record]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date) {
            toast.error('Vui lòng chọn ngày khám');
            return;
        }

        setIsLoading(true);

        try {
            // Upload new files first
            const uploadedUrls: string[] = [];
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(file => uploadService.uploadFile(file, 'medical-records'));
                const results = await Promise.all(uploadPromises);
                uploadedUrls.push(...results);
            }

            const payload: UpdateMedicalRecordRequest = {
                date,
                diagnosis,
                doctorName,
                clinicName,
                notes,
                type: recordType,
                attachments: [...existingAttachments, ...uploadedUrls],
            };

            await medicalRecordService.updateMedicalRecord(record.id, payload);
            toast.success('Đã cập nhật hồ sơ y tế');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-[#1e242b] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-[#101418] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f05324]">edit_note</span>
                        Chỉnh sửa bản ghi y tế
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-[#5c738a] hover:text-[#101418] dark:hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Loại bản ghi</label>
                            <div className="relative">
                                <select 
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value as RecordType)}
                                    className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324] appearance-none"
                                >
                                    <option value="VACCINE">Tiêm phòng (Vaccine)</option>
                                    <option value="CHECKUP">Kiểm tra tổng quát (Checkup)</option>
                                    <option value="SURGERY">Phẫu thuật (Surgery)</option>
                                    <option value="MEDICATION">Điều trị thuốc (Medication)</option>
                                    <option value="OTHER">Khác (Other)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Ngày khám</label>
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Tiêu đề / Chẩn đoán</label>
                            <input 
                                type="text"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Phòng khám</label>
                            <input 
                                type="text"
                                value={clinicName}
                                onChange={(e) => setClinicName(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                            />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Bác sĩ điều trị</label>
                            <input 
                                type="text"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Ghi chú</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324] resize-none" 
                            rows={4}
                        ></textarea>
                    </div>
                    
                    {/* Existing Attachments */}
                    {existingAttachments.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">File đã đính kèm</label>
                            <div className="space-y-2">
                                {existingAttachments.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#f05324] truncate max-w-[200px] hover:underline">File {index + 1}</a>
                                        <button 
                                            type="button" 
                                            onClick={() => removeExistingAttachment(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Thêm file mới</label>
                        <div 
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-[#f8fafc] dark:bg-gray-800/50 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <span className="material-symbols-outlined text-2xl text-[#5c738a]">cloud_upload</span>
                            <p className="text-sm font-medium text-[#5c738a]">Tải lên file mới</p>
                            <input 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden" 
                                multiple 
                                type="file" 
                                accept="image/*,.pdf"
                            />
                        </div>
                        {newFiles.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {newFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                                        <span className="truncate max-w-[200px] text-green-700">{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeNewFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 rounded-b-2xl">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 h-11 rounded-xl font-bold text-sm text-[#5c738a] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="px-8 h-11 rounded-xl font-bold text-sm text-white bg-[#f05324] hover:bg-[#d94317] shadow-lg shadow-[#f05324]/25 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
