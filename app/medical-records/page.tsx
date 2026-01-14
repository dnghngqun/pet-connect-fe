'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import medicalRecordService, { MedicalRecordDTO } from '@/services/medicalRecordService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateMedicalRecordModal from '@/components/medical/create-medical-record-modal';
import EditMedicalRecordModal from '@/components/medical/edit-medical-record-modal';
import ConfirmModal from '@/components/common/confirm-modal';
import { toast } from 'react-hot-toast';

export default function MedicalRecordsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [records, setRecords] = useState<MedicalRecordDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPet, setCurrentPet] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecordDTO | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);

    const PRIMARY_COLOR = '#f05324';
    const BG_LIGHT = '#faf8f5';

    useEffect(() => {
        // Load current pet
        const storedPet = localStorage.getItem('current-pet');
        if (storedPet) {
            setCurrentPet(JSON.parse(storedPet));
        }
    }, []);

    useEffect(() => {
        if (currentPet?.id) {
            fetchRecords();
        } else {
            setLoading(false);
        }
    }, [currentPet]);

    const fetchRecords = async () => {
        if (!currentPet?.id) return;
        setLoading(true);
        try {
            const data = await medicalRecordService.getMedicalRecordsByPet(currentPet.id);
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = async (id: number) => {
        setDeletingRecordId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRecord = async () => {
        if (!deletingRecordId) return;
        try {
            const success = await medicalRecordService.deleteMedicalRecord(deletingRecordId);
            if (success) {
                toast.success('Đã xóa bản ghi y tế');
                fetchRecords();
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể xóa bản ghi');
        } finally {
            setDeletingRecordId(null);
        }
    };

    if (authLoading || (!currentPet && loading)) {
         return <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#19191f]">
            <span className="material-symbols-outlined animate-spin text-[#f05324] text-4xl">progress_activity</span>
         </div>;
    }

    if (!currentPet) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] dark:bg-[#19191f] p-4 text-center">
                 <div className="bg-white dark:bg-[#232329] p-8 rounded-2xl shadow-soft">
                    <span className="material-symbols-outlined text-[#f05324] text-6xl mb-4">pets</span>
                    <h2 className="text-2xl font-bold text-[#1b110d] dark:text-white mb-2">Chưa chọn thú cưng</h2>
                    <p className="text-[#9a5f4c] dark:text-gray-400 mb-6">Vui lòng chọn thú cưng để xem hồ sơ y tế.</p>
                 </div>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center w-full px-4 sm:px-10 py-8 bg-[#faf8f5] dark:bg-[#19191f] min-h-screen">
            <div className="w-full max-w-[1024px] flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <a href="/" className="text-[#9a5f4c] hover:text-[#f05324] transition-colors font-medium">Trang chủ</a>
                    <span className="text-[#9a5f4c] dark:text-gray-600">/</span>
                    <a href={`/profile/${currentPet.id}`} className="text-[#9a5f4c] hover:text-[#f05324] transition-colors font-medium">Hồ sơ thú cưng</a>
                    <span className="text-[#9a5f4c] dark:text-gray-600">/</span>
                    <span className="text-[#1b110d] dark:text-white font-bold">Hồ sơ y tế</span>
                </div>

                <div className="bg-white dark:bg-[#232329] rounded-2xl p-6 shadow-sm border border-[#E5E5E5] dark:border-gray-800">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                             <div 
                                className="size-32 rounded-full border-4 border-white dark:border-[#232329] shadow-md bg-cover bg-center shrink-0" 
                                style={{ backgroundImage: `url('${currentPet.profilePhoto || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100"}')` }}
                             ></div>
                            <div className="text-center md:text-left pt-2">
                                <h1 className="text-3xl font-extrabold text-[#1b110d] dark:text-white tracking-tight mb-2">{currentPet.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                                    <span className="bg-[#fff0eb] dark:bg-[#f05324]/20 text-[#f05324] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{currentPet.breed || 'Chưa rõ giống'}</span>
                                    <span className="text-[#9a5f4c] dark:text-gray-400 text-sm font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">cake</span> {new Date().getFullYear() - new Date(currentPet.birthDate).getFullYear()} tuổi
                                    </span>
                                    <span className="text-[#9a5f4c] dark:text-gray-400 text-sm font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">monitor_weight</span> {currentPet.weight || '--'}kg
                                    </span>
                                </div>
                                <div className="flex gap-2 justify-center md:justify-start">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Khỏe mạnh
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf8f5] dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-bold text-[#1b110d] dark:text-white">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#1b110d] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#f05324]">history_edu</span> Lịch sử khám chữa bệnh
                            </h3>
                        </div>

                        <div className="relative border-l-2 border-dashed border-[#E5E5E5] dark:border-gray-800 ml-4 md:ml-6 space-y-8 pb-8">
                            {records.length === 0 ? (
                                 <div className="pl-10 text-[#9a5f4c] italic">Chưa có bản ghi y tế nào.</div>
                            ) : (
                                records.map((record, index) => (
                                    <div key={record.id} className="relative pl-8 md:pl-10 group">
                                        <div className="absolute -left-[9px] top-0 bg-[#faf8f5] dark:bg-[#19191f] py-1">
                                            <div className={`size-4 rounded-full border-4 border-white dark:border-[#19191f] shadow-sm ${index === 0 ? 'bg-[#f05324]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        </div>
                                        <span className="text-xs font-bold text-[#9a5f4c] uppercase tracking-wider mb-2 block">
                                            {format(new Date(record.date), 'dd MMMM, yyyy', { locale: vi })}
                                        </span>
                                        <div className={`bg-white dark:bg-[#232329] p-5 rounded-xl shadow-soft dark:shadow-none dark:border dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                                            record.type === 'VACCINE' ? 'border-l-blue-500' :
                                            record.type === 'CHECKUP' ? 'border-l-green-500' :
                                            record.type === 'SURGERY' ? 'border-l-red-500' :
                                            'border-l-orange-400'
                                        }`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                         record.type === 'VACCINE' ? 'bg-blue-50 text-blue-500' :
                                                         record.type === 'CHECKUP' ? 'bg-green-50 text-green-500' :
                                                         record.type === 'SURGERY' ? 'bg-red-50 text-red-500' :
                                                         'bg-orange-50 text-orange-500'
                                                    } dark:bg-opacity-20`}>
                                                        <span className="material-symbols-outlined">
                                                            {record.type === 'VACCINE' ? 'vaccines' :
                                                             record.type === 'CHECKUP' ? 'medical_services' :
                                                             record.type === 'SURGERY' ? 'healing' : 'pets'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-[#1b110d] dark:text-white leading-tight">{record.diagnosis}</h4>
                                                        <p className="text-sm text-[#9a5f4c]">{record.clinicName || 'Phòng khám chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                     record.type === 'VACCINE' ? 'bg-blue-100 text-blue-700' :
                                                     record.type === 'CHECKUP' ? 'bg-green-100 text-green-700' :
                                                     record.type === 'SURGERY' ? 'bg-red-100 text-red-700' :
                                                     'bg-orange-100 text-orange-700'
                                                } dark:bg-opacity-20 dark:text-opacity-80`}>
                                                    {record.type}
                                                </span>
                                            </div>
                                            <p className="text-[#4a5568] dark:text-gray-300 text-sm leading-relaxed mb-4">
                                                {record.notes || 'Không có ghi chú.'}
                                            </p>
                                            <div className="flex items-center gap-4 border-t border-[#f3eae7] dark:border-gray-800 pt-3">
                                                <div className="flex items-center gap-2 text-xs font-medium text-[#9a5f4c]">
                                                    <div className="size-6 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100)' }}></div>
                                                    {record.doctorName || 'Bác sĩ chưa cập nhật'}
                                                </div>
                                                {record.attachments && record.attachments.length > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-[#f05324] cursor-pointer hover:underline">
                                                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                                        File đính kèm ({record.attachments.length})
                                                    </div>
                                                )}
                                                <div className="ml-auto flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingRecord(record);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-[#9a5f4c] hover:text-[#f05324] transition-colors p-1"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRecord(record.id);
                                                        }}
                                                        className="text-[#9a5f4c] hover:text-red-500 transition-colors p-1"
                                                        title="Xóa"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#232329] p-5 rounded-2xl shadow-sm border border-[#E5E5E5] dark:border-gray-800 flex flex-col gap-4">
                             <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-[#f05324] hover:bg-[#d94317] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#f05324]/30 transition-all transform active:scale-[0.98]"
                             >
                                <span className="material-symbols-outlined">add_circle</span>
                                Thêm bản ghi y tế mới
                            </button>
                            <p className="text-xs text-center text-[#9a5f4c]">Cập nhật thông tin sức khỏe giúp bạn theo dõi tình trạng thú cưng tốt hơn.</p>
                        </div>

                        <div className="bg-white dark:bg-[#232329] p-6 rounded-2xl shadow-sm border border-[#E5E5E5] dark:border-gray-800">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1b110d] dark:text-white">Cân nặng</h3>
                                    <p className="text-sm text-[#9a5f4c]">6 tháng gần nhất</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-[#1b110d] dark:text-white">{currentPet.weight || '--'} <span className="text-sm font-normal text-[#9a5f4c]">kg</span></span>
                                </div>
                            </div>
                            <div className="relative h-40 w-full flex items-center justify-center text-[#9a5f4c] text-sm bg-gray-50 dark:bg-white/5 rounded-xl">
                                [Biểu đồ cân nặng sẽ được cập nhật]
                            </div>
                        </div>

                        <div className="bg-[#fff0eb] dark:bg-[#f05324]/10 p-5 rounded-2xl border border-[#f05324]/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white dark:bg-[#232329] p-1.5 rounded-full shadow-sm text-[#f05324]">
                                    <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                                </div>
                                <h4 className="font-bold text-[#1b110d] dark:text-white">Lịch nhắc sắp tới</h4>
                            </div>
                             <div className="mt-3 pl-2 border-l-2 border-[#f05324]/30">
                                <p className="text-sm font-bold text-[#1b110d] dark:text-white">Kiểm tra định kỳ</p>
                                <p className="text-xs text-[#9a5f4c] mt-1">Sắp tới</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateMedicalRecordModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={fetchRecords} 
                    petId={currentPet.id}
                />
            )}

            {editingRecord && (
                <EditMedicalRecordModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingRecord(null);
                    }} 
                    onSuccess={fetchRecords} 
                    record={editingRecord}
                />
            )}

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingRecordId(null);
                }}
                onConfirm={confirmDeleteRecord}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa bản ghi y tế này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive={true}
            />
        </main>
    );
}
