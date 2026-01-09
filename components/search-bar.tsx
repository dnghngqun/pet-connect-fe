import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showResults?: boolean;
  className?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Tìm kiếm bài viết, thú cưng...",
  showResults = true,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query || query.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/v1/posts?q=${encodeURIComponent(query)}&size=5`
        );
        const data = await response.json();
        
        if (data.success && data.data?.posts) {
          setResults(data.data.posts);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      onSearch?.(query);
    }
  };

  const handleSelectResult = (postSlug: string) => {
    router.push(`/pet/${postSlug}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      
      {showResults && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <Command>
            <CommandList>
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Đang tìm kiếm...
                  </span>
                </div>
              ) : results.length > 0 ? (
                <CommandGroup heading="Kết quả">
                  {results.map((post) => (
                    <CommandItem
                      key={post.id}
                      onSelect={() => handleSelectResult(post.slug)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {post.city} • {post.petType}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                    className="cursor-pointer border-t mt-2 pt-2"
                  >
                    <div className="w-full text-center text-sm text-primary">
                      Xem tất cả kết quả cho "{query}"
                    </div>
                  </CommandItem>
                </CommandGroup>
              ) : query.length >= 2 ? (
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Không tìm thấy kết quả cho "{query}"
                  </div>
                </CommandEmpty>
              ) : (
                <div className="py-4 px-4 text-sm text-muted-foreground">
                  Nhập ít nhất 2 ký tự để tìm kiếm
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
