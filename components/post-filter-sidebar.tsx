import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export type PostType = 'LOST_FOUND' | 'ADOPTION' | 'REVIEW' | 'QNA' | 'TIP' | 'BREEDING' | 'MARKETPLACE';

interface PostFilterSidebarProps {
  selectedTypes: PostType[];
  selectedTags: string[];
  onTypesChange: (types: PostType[]) => void;
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  onClearAll?: () => void;
}

const POST_TYPES: { value: PostType; label: string; icon: string; count?: number }[] = [
  { value: 'LOST_FOUND', label: 'Thất lạc', icon: '🔍' },
  { value: 'ADOPTION', label: 'Nhận nuôi', icon: '🏠' },
  { value: 'REVIEW', label: 'Review', icon: '⭐' },
  { value: 'QNA', label: 'Hỏi đáp', icon: '❓' },
  { value: 'TIP', label: 'Mẹo hay', icon: '💡' },
  { value: 'BREEDING', label: 'Phối giống', icon: '💕' },
  { value: 'MARKETPLACE', label: 'Chợ Pet', icon: '🛒' },
];

const POPULAR_TAGS = [
  'chó', 'mèo', 'cấp cứu', 'HCM', 'Hà Nội',
  'husky', 'golden', 'corgi', 'phốc sóc',
  'thú y', 'spa', 'khách sạn', 'cửa hàng',
  'chăm sóc', 'huấn luyện', 'dinh dưỡng'
];

export default function PostFilterSidebar({
  selectedTypes,
  selectedTags,
  onTypesChange,
  onTagsChange,
  availableTags = POPULAR_TAGS,
  onClearAll,
}: PostFilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeToggle = (type: PostType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const activeFilterCount = selectedTypes.length + selectedTags.length;

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Filter className="h-4 w-4 mr-2" />
        Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 left-0 h-screen md:h-auto w-80 bg-white border-r
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="font-bold text-lg">Bộ lọc</h2>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
              >
                Xóa tất cả
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Post Types Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                LOẠI BÀI VIẾT
              </h3>
              <div className="space-y-2">
                {POST_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    />
                    <span className="text-lg">{type.icon}</span>
                    <span className="flex-1 text-sm">{type.label}</span>
                    {type.count && (
                      <Badge variant="secondary" className="text-xs">
                        {type.count}
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                TAGS PHỔ BIẾN
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selected Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                  ĐÃ CHỌN
                </h3>
                <div className="space-y-2">
                  {selectedTypes.map((type) => {
                    const config = POST_TYPES.find(t => t.value === type);
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between p-2 bg-primary/5 rounded-lg"
                      >
                        <span className="text-sm flex items-center gap-2">
                          <span>{config?.icon}</span>
                          {config?.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleTypeToggle(type)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 bg-primary/5 rounded-lg"
                    >
                      <span className="text-sm">#{tag}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleTagToggle(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
