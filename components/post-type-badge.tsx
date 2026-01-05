import { Badge } from '@/components/ui/badge';

export type PostType = 'LOST_FOUND' | 'ADOPTION' | 'REVIEW' | 'QNA' | 'TIP' | 'BREEDING' | 'MARKETPLACE';

interface PostTypeBadgeProps {
  type: PostType;
  size?: 'sm' | 'md' | 'lg';
}

const POST_TYPE_CONFIG: Record<PostType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  LOST_FOUND: {
    label: 'Thất lạc',
    icon: '🔍',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  ADOPTION: {
    label: 'Nhận nuôi',
    icon: '🏠',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  REVIEW: {
    label: 'Review',
    icon: '⭐',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  QNA: {
    label: 'Hỏi đáp',
    icon: '❓',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  TIP: {
    label: 'Mẹo hay',
    icon: '💡',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  BREEDING: {
    label: 'Phối giống',
    icon: '💕',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  MARKETPLACE: {
    label: 'Chợ Pet',
    icon: '🛒',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
};

export default function PostTypeBadge({ type, size = 'md' }: PostTypeBadgeProps) {
  const config = POST_TYPE_CONFIG[type];
  
  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      className={`
        ${config.bgColor} 
        ${config.color} 
        ${config.borderColor} 
        border
        ${sizeClasses[size]}
        font-medium
        inline-flex items-center gap-1
        hover:opacity-80 transition-opacity
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  );
}
