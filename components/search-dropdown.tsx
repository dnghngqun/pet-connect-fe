'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, FileText, Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FriendRequestButton from '@/components/friend-request-button';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'user' | 'post' | 'group';
  id: string | number;
  title: string;
  subtitle?: string;
  avatar?: string;
  slug?: string;
}

interface SearchDropdownProps {
  results: SearchResult[];
  loading: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
}

export default function SearchDropdown({ results, loading, onClose, onSelect }: SearchDropdownProps) {
  const router = useRouter();

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return 'Người dùng';
      case 'post':
        return 'Bài viết';
      case 'group':
        return 'Nhóm';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-4 z-50">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Đang tìm kiếm...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border overflow-hidden z-50 max-h-96 overflow-y-auto">
      {results.map((result, index) => (
        <button
          key={`${result.type}-${result.id}`}
          onClick={() => handleSelect(result)}
          className={cn(
            "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition text-left",
            index !== results.length - 1 && "border-b"
          )}
        >
          {result.avatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={result.avatar} className="object-cover" />
              <AvatarFallback className="uppercase">{result.title.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {getIcon(result.type)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{result.title}</p>
            {result.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
            {getTypeLabel(result.type)}
          </span>
        </button>
      ))}
    </div>
  );
}
