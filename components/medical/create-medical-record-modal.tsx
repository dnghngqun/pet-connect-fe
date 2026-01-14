'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import uploadService from '@/services/uploadService';
import medicalRecordService, { CreateMedicalRecordRequest, RecordType } from '@/services/medicalRecordService';

interface CreateMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    petId: string;
}

export default function CreateMedicalRecordModal({ isOpen, onClose, onSuccess, petId }: CreateMedicalRecordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState(''); // "Loại bản ghi" maps to this if free text, or use Type
    const [recordType, setRecordType] = useState<RecordType | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [clinicName, setClinicName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recordType) {
            toast.error('Vui lòng chọn loại bản ghi');
            return;
        }
        if (!date) {
            toast.error('Vui lòng chọn ngày khám');
            return;
        }

        setIsLoading(true);

        try {
            // Upload files first
            const uploadedUrls: string[] = [];
            if (files.length > 0) {
                const uploadPromises = files.map(file => uploadService.uploadFile(file, 'medical-records'));
                const results = await Promise.all(uploadPromises);
                uploadedUrls.push(...results);
            }

            const payload: CreateMedicalRecordRequest = {
                petId,
                date,
                diagnosis: diagnosis || getDiagnosisFromType(recordType), // Default diagnosis if empty
                clinicName,
                doctorName,
                notes,
                type: recordType as RecordType,
                attachments: uploadedUrls,
                weight: undefined // Optional in this form
            };

            await medicalRecordService.createMedicalRecord(payload);
            toast.success('Đã tạo hồ sơ y tế thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Có lỗi xảy ra khi tạo hồ sơ');
        } finally {
            setIsLoading(false);
        }
    };

    const getDiagnosisFromType = (type: string) => {
       switch(type) {
           case 'VACCINE': return 'Tiêm phòng';
           case 'CHECKUP': return 'Kiểm tra sức khỏe';
           case 'SURGERY': return 'Phẫu thuật';
           case 'MEDICATION': return 'Điều trị thuốc';
           default: return 'Khám bệnh';
       }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e242b] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-[#101418] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f05324]">add_notes</span>
                        Thêm bản ghi y tế mới
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
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Loại bản ghi <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select 
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value as RecordType)}
                                    className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324] appearance-none"
                                >
                                    <option value="">Chọn loại bản ghi</option>
                                    <option value="VACCINE">Tiêm phòng (Vaccine)</option>
                                    <option value="CHECKUP">Kiểm tra tổng quát (Checkup)</option>
                                    <option value="SURGERY">Phẫu thuật (Surgery)</option>
                                    <option value="MEDICATION">Điều trị thuốc (Medication)</option>
                                    <option value="OTHER">Khác (Other)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Ngày khám <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Tiêu đề / Chẩn đoán</label>
                            <input 
                                type="text"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                                placeholder="VD: Tiêm Vaccine 7 bệnh" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Cơ sở y tế / Phòng khám</label>
                            <input 
                                type="text"
                                value={clinicName}
                                onChange={(e) => setClinicName(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                                placeholder="Nhập tên phòng khám" 
                            />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Bác sĩ điều trị</label>
                            <input 
                                type="text"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                className="w-full h-11 bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324]" 
                                placeholder="Họ tên bác sĩ" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Nội dung chi tiết / Ghi chú</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-[#f8fafc] dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#f05324]/50 focus:border-[#f05324] resize-none" 
                            placeholder="Nhập kết quả chẩn đoán, lời dặn của bác sĩ..." 
                            rows={4}
                        ></textarea>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#101418] dark:text-gray-300">Tệp đính kèm</label>
                        <div 
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-[#f8fafc] dark:bg-gray-800/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <span className="material-symbols-outlined text-4xl text-[#5c738a]">cloud_upload</span>
                            <p className="text-sm font-medium text-[#101418] dark:text-white">Tải lên ảnh hoặc tệp tin</p>
                            <p className="text-xs text-[#5c738a]">Sổ tiêm, đơn thuốc, ảnh kết quả xét nghiệm (Max 10MB)</p>
                            <input 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden" 
                                multiple 
                                type="file" 
                                accept="image/*,.pdf"
                            />
                        </div>
                        {files.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)}
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
                            Lưu hồ sơ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
