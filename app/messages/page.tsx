'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ChatType, MessageType, UserType } from '@/lib/chat.types';
import { Pet } from '@/services/petService';

export default function MessagesPage() {
    const { user } = useAuth();
    const { 
        chats, 
        messages, 
        selectedChatId, 
        selectChat, 
        sendMessage, 
        isChatsLoading, 
        isMessagesLoading,
        currentChat,
        currentUser
    } = useChat();
    
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPet, setCurrentPet] = useState<Pet | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load current pet from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPet = localStorage.getItem('current-pet');
            if (storedPet) {
                setCurrentPet(JSON.parse(storedPet));
            }
            
            // Listen for pet changes
            const handleStorageChange = () => {
                const updatedPet = localStorage.getItem('current-pet');
                if (updatedPet) {
                    setCurrentPet(JSON.parse(updatedPet));
                }
            };
            
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    }, [messageInput]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChatId) return;
        
        await sendMessage({
            chatId: selectedChatId,
            content: messageInput.trim()
        });
        setMessageInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getOtherParticipant = (chat: ChatType): UserType | undefined => {
        if (!currentUser) return chat.participants[0];
        return chat.participants.find(p => String(p._id) !== String(currentUser._id));
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 24 * 60 * 60 * 1000) {
            return format(date, 'HH:mm');
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return format(date, 'EEEE', { locale: vi });
        }
        return format(date, 'dd/MM');
    };

    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        const other = getOtherParticipant(chat);
        return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const selectedOtherUser = currentChat ? getOtherParticipant(currentChat) : null;

    // Redirect to select pet if no current pet
    if (!currentPet) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white dark:bg-[#19191f]">
                <div className="text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-[#f05324] mb-4 block">pets</span>
                    <h2 className="text-xl font-bold text-[#1b110d] dark:text-white mb-2">Chọn thú cưng để bắt đầu</h2>
                    <p className="text-[#9a5f4c] mb-4">Bạn cần chọn một thú cưng để trò chuyện với các bạn bè khác</p>
                    <a 
                        href="/select-pet" 
                        className="inline-block px-6 py-3 bg-[#f05324] text-white rounded-xl font-medium hover:bg-[#d94317] transition-colors"
                    >
                        Chọn thú cưng
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-[#19191f]">
            {/* Sidebar - Conversation List */}
            <aside className="w-[380px] flex flex-col border-r border-gray-100 dark:border-gray-800 bg-[#fff8f6] dark:bg-[#232329] shrink-0">
                {/* Current Pet Profile Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#19191f] rounded-xl shadow-sm">
                        <div className="relative">
                            <div 
                                className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm bg-gray-200"
                                style={{ backgroundImage: currentPet.profilePhoto ? `url('${currentPet.profilePhoto}')` : undefined }}
                            >
                                {!currentPet.profilePhoto && (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white font-bold text-lg">
                                        {currentPet.name?.charAt(0) || '🐾'}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#19191f] rounded-full"></div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <h2 className="font-bold text-lg text-[#1b110d] dark:text-white leading-tight">{currentPet.name}</h2>
                            <span className="text-xs text-[#9a5f4c] font-medium">{currentPet.breed || currentPet.species}</span>
                        </div>
                        <a href="/select-pet" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-[#9a5f4c] dark:text-gray-400 transition-colors" title="Đổi thú cưng">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
                        </a>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[#9a5f4c] group-focus-within:text-[#f05324] transition-colors" style={{ fontSize: '20px' }}>search</span>
                        </div>
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white dark:bg-[#19191f] text-[#1b110d] dark:text-gray-100 placeholder-[#9a5f4c] focus:outline-none focus:ring-2 focus:ring-[#f05324]/50 shadow-sm transition-all" 
                            placeholder="Tìm kiếm bạn thú cưng..." 
                            type="text"
                        />
                    </div>
                </div>

                {/* Online Friends */}
                {chats.filter(c => getOtherParticipant(c)?.isOnline).length > 0 && (
                    <div className="px-6 py-4">
                        <h3 className="text-xs font-bold text-[#9a5f4c] uppercase tracking-wider mb-3">Bạn bè đang online</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide">
                            {chats.filter(c => getOtherParticipant(c)?.isOnline).slice(0, 5).map(chat => {
                                const other = getOtherParticipant(chat);
                                return (
                                    <div 
                                        key={chat._id}
                                        onClick={() => selectChat(chat._id || '')}
                                        className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer snap-start group"
                                    >
                                        <div className="w-14 h-14 rounded-full p-[2px] border-2 border-[#f05324] group-hover:scale-105 transition-transform">
                                            <div 
                                                className="w-full h-full rounded-full bg-cover bg-center border-2 border-white dark:border-[#232329] bg-gray-200"
                                                style={{ backgroundImage: other?.avatar ? `url('${other.avatar}')` : undefined }}
                                            >
                                                {!other?.avatar && (
                                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white font-bold text-sm">
                                                        {other?.name?.charAt(0) || '🐾'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-[#1b110d] dark:text-gray-300 truncate w-full text-center">{other?.name?.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-thin">
                    {isChatsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="material-symbols-outlined animate-spin text-[#f05324] text-2xl">progress_activity</span>
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="text-center py-8 text-[#9a5f4c]">
                            <span className="material-symbols-outlined text-4xl mb-2 block">chat_bubble_outline</span>
                            <p>Chưa có cuộc trò chuyện nào</p>
                            <p className="text-sm mt-1">Tìm bạn thú cưng mới để bắt đầu!</p>
                        </div>
                    ) : (
                        filteredChats.map((chat) => {
                            const other = getOtherParticipant(chat);
                            const isActive = chat._id === selectedChatId;
                            
                            return (
                                <div 
                                    key={chat._id}
                                    onClick={() => selectChat(chat._id || '')}
                                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all group ${
                                        isActive 
                                            ? 'bg-white dark:bg-[#19191f] shadow-sm border border-[#f05324]/20 transform hover:scale-[1.02]' 
                                            : 'hover:bg-white dark:hover:bg-[#19191f]'
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <div 
                                            className="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200"
                                            style={{ backgroundImage: other?.avatar ? `url('${other.avatar}')` : undefined }}
                                        >
                                            {!other?.avatar && (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white font-bold text-lg">
                                                    {other?.name?.charAt(0) || '🐾'}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${other?.isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-[#fff8f6] dark:border-[#232329] rounded-full`}></div>
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-[#1b110d] dark:text-white truncate">{other?.name || 'Unknown'}</h3>
                                            <span className={`text-[10px] ${isActive ? 'text-[#f05324] font-bold' : 'text-[#9a5f4c]'}`}>
                                                {chat.lastMessage?.createdAt ? formatMessageTime(chat.lastMessage.createdAt) : ''}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${isActive ? 'text-[#1b110d] dark:text-gray-300 font-medium' : 'text-[#9a5f4c] dark:text-gray-400'}`}>
                                            {chat.lastMessage?.content || 'Woof! Bắt đầu cuộc trò chuyện 🐾'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-white dark:bg-[#19191f] relative">
                {!selectedChatId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#9a5f4c]">
                        <span className="material-symbols-outlined text-6xl mb-4">pets</span>
                        <p className="text-lg font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
                        <p className="text-sm mt-2">{currentPet.name} đang chờ kết nối với bạn bè!</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <header className="h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white/90 dark:bg-[#19191f]/95 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div 
                                        className="w-12 h-12 rounded-full bg-cover bg-center shadow-md cursor-pointer hover:opacity-90 transition-opacity bg-gray-200"
                                        style={{ backgroundImage: selectedOtherUser?.avatar ? `url('${selectedOtherUser.avatar}')` : undefined }}
                                    >
                                        {!selectedOtherUser?.avatar && (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white font-bold text-xl">
                                                {selectedOtherUser?.name?.charAt(0) || '🐾'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${selectedOtherUser?.isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-[#19191f] rounded-full`}></div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#1b110d] dark:text-white leading-none mb-1">{selectedOtherUser?.name}</h1>
                                    <p className={`text-sm font-medium flex items-center gap-1 ${selectedOtherUser?.isOnline ? 'text-green-600' : 'text-[#9a5f4c]'}`}>
                                        {selectedOtherUser?.isOnline ? '🐾 Đang hoạt động' : 'Đang nghỉ ngơi 💤'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#fff8f6] dark:hover:bg-[#232329] text-[#9a5f4c] transition-colors" title="Thông tin">
                                    <span className="material-symbols-outlined">info</span>
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div 
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
                            style={{ 
                                backgroundImage: 'radial-gradient(#f0532410 1px, transparent 1px)', 
                                backgroundSize: '20px 20px' 
                            }}
                        >
                            {isMessagesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="material-symbols-outlined animate-spin text-[#f05324] text-2xl">progress_activity</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-[#9a5f4c]">
                                    <span className="material-symbols-outlined text-5xl mb-3">waving_hand</span>
                                    <p className="font-medium">Woof! Bắt đầu cuộc trò chuyện!</p>
                                    <p className="text-sm mt-1">{currentPet.name} muốn chào hỏi {selectedOtherUser?.name}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Timestamp */}
                                    <div className="flex justify-center">
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-[#232329] rounded-full text-xs text-[#9a5f4c] font-medium">
                                            {messages[0]?.createdAt ? format(new Date(messages[0].createdAt), "'Hôm nay,' HH:mm", { locale: vi }) : ''}
                                        </span>
                                    </div>

                                    {messages.map((message, index) => {
                                        const isOwn = message.sender?._id === currentUser?._id;
                                        const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id);
                                        
                                        return (
                                            <div key={message._id} className={`flex gap-3 max-w-[70%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
                                                {!isOwn && showAvatar && (
                                                    <div 
                                                        className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 self-end mb-1 bg-gray-200"
                                                        style={{ backgroundImage: selectedOtherUser?.avatar ? `url('${selectedOtherUser.avatar}')` : undefined }}
                                                    >
                                                        {!selectedOtherUser?.avatar && (
                                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white text-xs font-bold">
                                                                {selectedOtherUser?.name?.charAt(0) || '🐾'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {!isOwn && !showAvatar && <div className="w-8 shrink-0" />}
                                                
                                                {/* Own messages show current pet avatar */}
                                                {isOwn && (index === messages.length - 1 || messages[index + 1]?.sender?._id !== message.sender?._id) && (
                                                    <div 
                                                        className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 self-end mb-1 bg-gray-200"
                                                        style={{ backgroundImage: currentPet.profilePhoto ? `url('${currentPet.profilePhoto}')` : undefined }}
                                                    >
                                                        {!currentPet.profilePhoto && (
                                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f05324] to-[#ff8c42] flex items-center justify-center text-white text-xs font-bold">
                                                                {currentPet.name?.charAt(0) || '🐾'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
                                                    {message.image && (
                                                        <div className="relative group cursor-pointer overflow-hidden rounded-2xl w-fit shadow-md">
                                                            <img src={message.image} alt="Shared image" className="max-w-xs md:max-w-sm rounded-2xl transition-transform duration-300 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                        </div>
                                                    )}
                                                    {message.content && (
                                                        <div className={`p-4 text-base leading-relaxed ${
                                                            isOwn 
                                                                ? 'bg-[#f05324] text-white rounded-2xl rounded-br-none shadow-lg shadow-[#f05324]/20' 
                                                                : 'bg-white dark:bg-[#232329] text-[#1b110d] dark:text-gray-100 rounded-2xl rounded-bl-none shadow-md'
                                                        }`}>
                                                            {message.isRecalled ? (
                                                                <span className="italic opacity-70">Tin nhắn đã bị thu hồi</span>
                                                            ) : message.content}
                                                        </div>
                                                    )}
                                                    {isOwn && index === messages.length - 1 && (
                                                        <span className="text-[10px] text-[#9a5f4c] font-medium mr-1">Đã xem 🐾</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 pt-2 bg-white dark:bg-[#19191f]">
                            <div className="bg-white dark:bg-[#232329] p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-end gap-2 relative">
                                {/* Tools */}
                                <div className="flex items-center gap-1 pb-2 pl-2">
                                    <button className="p-2 rounded-full hover:bg-[#fff8f6] dark:hover:bg-gray-700 text-[#f05324] transition-colors">
                                        <span className="material-symbols-outlined">add_photo_alternate</span>
                                    </button>
                                </div>
                                
                                {/* Input */}
                                <textarea 
                                    ref={textareaRef}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 max-h-32 py-3 px-2 bg-transparent border-none focus:ring-0 text-[#1b110d] dark:text-gray-100 placeholder-[#9a5f4c] resize-none leading-relaxed" 
                                    placeholder={`${currentPet.name} muốn nói gì...`}
                                    rows={1}
                                />
                                
                                {/* Emoji & Send */}
                                <div className="flex items-center gap-2 pb-2 pr-2">
                                    <button className="p-2 rounded-full hover:bg-[#fff8f6] dark:hover:bg-gray-700 text-[#9a5f4c] hover:text-[#f05324] transition-colors">
                                        <span className="material-symbols-outlined">mood</span>
                                    </button>
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="w-10 h-10 rounded-full bg-[#f05324] hover:bg-[#d94317] text-white flex items-center justify-center shadow-md shadow-[#f05324]/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-[#9a5f4c] mt-2 opacity-60">Nhấn Enter để gửi, Shift + Enter để xuống dòng</p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
