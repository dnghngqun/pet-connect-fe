'use client';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Xác nhận", 
    cancelText = "Hủy",
    isDestructive = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
            <div className="absolute inset-0 bg-[#101914]/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-custom-card-dark rounded-2xl shadow-soft-hover max-w-sm w-full transform transition-all overflow-hidden border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.2s_ease-out]">
                <div className="p-6 text-center">
                    <div className={`mx-auto mb-4 size-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-custom-primary/20 text-custom-primary'}`}>
                        <span className="material-symbols-outlined text-[28px]">
                            {isDestructive ? 'warning' : 'info'}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-custom-text-main dark:text-white mb-2">{title}</h3>
                    <p className="text-custom-text-sub dark:text-gray-400 text-sm leading-relaxed mb-6">
                        {message}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-600 text-custom-text-sub hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold shadow-soft hover:shadow-md transition-all ${
                                isDestructive 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-custom-primary hover:bg-custom-primary-hover text-[#101914]'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
