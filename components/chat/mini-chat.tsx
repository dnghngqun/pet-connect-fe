'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { useWebSocketChat } from '@/hooks/useWebSocketChat';
import authService from '@/services/authService';

export default function MiniChat() {
  const { isOpen, isMinimized, recipient, closeChat, minimizeChat, activeConversationId } = useChatContext();
  const { messages, sendMessage, isConnected, loadMore, hasMore, isLoadingHistory } = useWebSocketChat(activeConversationId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getCurrentUser();
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom on open or new message (if near bottom or first load)
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
       // Only scroll to bottom if we are not loading history (i.e., new message arrived)
       // Or if it's the first load (not loading more)
       if (!isLoadingHistory) {
           scrollToBottom();
       }
    }
  }, [messages.length, isOpen, isMinimized, isLoadingHistory]);
  
  // Handle Scroll for Load More
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight } = e.currentTarget;
      if (scrollTop === 0 && hasMore && !isLoadingHistory) {
          setPrevScrollHeight(scrollHeight);
          loadMore();
      }
  };

  // Restore scroll position after loading more
  useEffect(() => {
      if (!isLoadingHistory && prevScrollHeight > 0 && messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const diff = newScrollHeight - prevScrollHeight;
          if (diff > 0) {
              messagesContainerRef.current.scrollTop = diff;
          }
          setPrevScrollHeight(0);
      }
  }, [messages.length, isLoadingHistory, prevScrollHeight]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
        console.error("Failed to send", error);
    }
  };

  if (isMinimized) {
      return (
          <div 
            className="fixed bottom-0 right-20 w-72 bg-white dark:bg-[#3c3632] shadow-xl rounded-t-xl border border-gray-200 dark:border-gray-700 cursor-pointer z-[100]"
            onClick={() => minimizeChat()}
          >
              <div className="px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-[#1d0e0c] dark:text-white truncate">
                      {(recipient as any)?.fullName || (recipient as any)?.name}
                  </span>
                  <span className="material-symbols-outlined text-gray-500">open_in_full</span>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed bottom-0 right-20 w-80 h-96 bg-white dark:bg-[#3c3632] shadow-2xl rounded-t-xl border border-gray-200 dark:border-gray-700 flex flex-col z-[100]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#ff7366] text-white rounded-t-xl flex items-center justify-between shrink-0 shadow-sm cursor-pointer" onClick={minimizeChat}>
         <div className="flex items-center gap-2 overflow-hidden">
             <div className="size-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {(recipient as any)?.avatarUrl ? (
                      <img src={(recipient as any).avatarUrl || ((recipient as any).avatar)} alt="Avatar" className="size-full rounded-full object-cover" />
                  ) : (
                      <span className="material-symbols-outlined text-sm">person</span>
                  )}
             </div>
             <div className="flex flex-col">
                 <span className="font-bold text-sm truncate max-w-[150px]">
                    {(recipient as any)?.fullName || (recipient as any)?.name}
                 </span>
                 <span className="text-[10px] opacity-90 flex items-center gap-1">
                     {isConnected ? <span className="size-1.5 rounded-full bg-green-400 block"/> : <span className="size-1.5 rounded-full bg-red-400 block"/>}
                     {isConnected ? 'Online' : 'Offline'}
                 </span>
             </div>
         </div>
         <div className="flex items-center gap-1">
             <button onClick={(e) => { e.stopPropagation(); minimizeChat(); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                 <span className="material-symbols-outlined text-[18px]">remove</span>
             </button>
             <button onClick={(e) => { e.stopPropagation(); closeChat(); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                 <span className="material-symbols-outlined text-[18px]">close</span>
             </button>
         </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcf8f8] dark:bg-[#2a2622]"
      >
          {isLoadingHistory && (
              <div className="flex justify-center py-2">
                  <div className="size-4 border-2 border-[#ff7366] border-t-transparent rounded-full animate-spin"></div>
              </div>
          )}
          
          {messages.map((msg) => {
              const isOwn = msg.sender?.id === currentUser?.id || msg.sender?._id === String(currentUser?.id); 
              return (
                  <div key={msg._id || msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          isOwn 
                            ? 'bg-[#ff7366] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-[#3c3632] text-[#1d0e0c] dark:text-gray-200 shadow-sm rounded-tl-none border border-gray-100 dark:border-gray-700'
                      }`}>
                          {msg.content}
                      </div>
                  </div>
              )
          })}
          {messages.length === 0 && !isLoadingHistory && (
             <div className="text-center text-gray-400 text-xs mt-10">
                 Bắt đầu cuộc trò chuyện...
             </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#3c3632] shrink-0 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none outline-none text-sm text-[#1d0e0c] dark:text-white"
          />
          <button 
             type="button" 
             className="p-2 text-gray-400 hover:text-[#ff7366] transition-colors"
          >
             <span className="material-symbols-outlined text-[20px]">image</span>
          </button>
          <button 
             type="submit" 
             disabled={!newMessage.trim()}
             className="p-2 bg-[#ff7366] text-white rounded-full hover:bg-[#ff7366]/90 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
             <span className="material-symbols-outlined text-[18px] translate-x-0.5">send</span>
          </button>
      </form>
    </div>
  );
}
