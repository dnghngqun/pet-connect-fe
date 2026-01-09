'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SearchResultsModal from './search-results-modal';
import userService from '@/services/userService';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {

        const response = await userService.searchUsers(query);
        if (response.success && response.data) {
          const userResults = response.data.map((user: any) => ({
            type: 'user' as const,
            id: user.userId || user.id,
            title: user.fullName || user.userName,
            subtitle: user.bio || user.email,
            avatar: user.avatarUrl,
            data: user,
          }));
          setResults(userResults);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm trên PetConnect..."
          className="pl-10 pr-10 bg-muted/50 border-none focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      
      {isOpen && query.length >= 2 && (
        <SearchResultsModal
          query={query}
          results={results}
          loading={loading}
          onClose={() => {
            setIsOpen(false);
            setQuery('');
            setResults([]);
          }}
        />
      )}
    </div>
  );
}
