'use client';

import { useRouter } from 'next/navigation';
import { User, FileText, Users as GroupIcon, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'user' | 'post' | 'group';
  id: string | number;
  title: string;
  subtitle?: string;
  avatar?: string;
  data?: any;
}

interface SearchResultsModalProps {
  query: string;
  results: SearchResult[];
  loading: boolean;
  onClose: () => void;
}

export default function SearchResultsModal({ query, results, loading, onClose }: SearchResultsModalProps) {
  const router = useRouter();

  const handleSelect = (result: SearchResult) => {
    let path = '';
    
    switch (result.type) {
      case 'user':
        path = `/profile/${result.id}`;
        break;
      case 'post':
        path = `/post/${result.id}`;
        break;
      case 'group':
        path = `/groups/${result.id}`;
        break;
    }
    
    if (path) {
      router.push(path);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'group':
        return <GroupIcon className="h-4 w-4" />;
      default:
        return null;
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

  const userResults = results.filter(r => r.type === 'user');
  const postResults = results.filter(r => r.type === 'post');
  const groupResults = results.filter(r => r.type === 'group');

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border p-4 z-50">
        <p className="text-sm text-muted-foreground text-center">Đang tìm kiếm...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border p-4 z-50">
        <p className="text-sm text-muted-foreground text-center">
          Không tìm thấy kết quả cho "{query}"
        </p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border overflow-hidden z-50 max-h-[500px] flex flex-col">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Tất cả ({results.length})
          </TabsTrigger>
          {userResults.length > 0 && (
            <TabsTrigger value="users" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Người dùng ({userResults.length})
            </TabsTrigger>
          )}
          {postResults.length > 0 && (
            <TabsTrigger value="posts" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Bài viết ({postResults.length})
            </TabsTrigger>
          )}
          {groupResults.length > 0 && (
            <TabsTrigger value="groups" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Nhóm ({groupResults.length})
            </TabsTrigger>
          )}
        </TabsList>

        <div className="overflow-y-auto max-h-[400px]">
          <TabsContent value="all" className="m-0">
            <ResultsList results={results} onSelect={handleSelect} />
          </TabsContent>
          
          <TabsContent value="users" className="m-0">
            <ResultsList results={userResults} onSelect={handleSelect} showAddFriend />
          </TabsContent>
          
          <TabsContent value="posts" className="m-0">
            <ResultsList results={postResults} onSelect={handleSelect} />
          </TabsContent>
          
          <TabsContent value="groups" className="m-0">
            <ResultsList results={groupResults} onSelect={handleSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  showAddFriend?: boolean;
}

function ResultsList({ results, onSelect, showAddFriend }: ResultsListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'group':
        return <GroupIcon className="h-4 w-4" />;
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
    }
  };

  return (
    <div className="divide-y">
      {results.map((result, index) => (
        <div
          key={`${result.type}-${result.id}`}
          className={cn(
            "flex items-center gap-3 p-3 hover:bg-muted/50 transition cursor-pointer",
            showAddFriend && "justify-between"
          )}
          onClick={() => !showAddFriend && onSelect(result)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => showAddFriend && onSelect(result)}>
            {result.type === 'user' ? (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={result.avatar} />
                <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {getIcon(result.type)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{result.title}</p>
              {result.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
              )}
            </div>
            
            {!showAddFriend && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full flex-shrink-0">
                {getTypeLabel(result.type)}
              </span>
            )}
          </div>

          {showAddFriend && result.type === 'user' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();

                console.log('Add friend:', result.id);
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Kết bạn
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
