import { ShoppingCart, Tag as TagIcon, Package, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface MarketplaceMetaDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair';
  category?: string;
  pickupMethod?: 'delivery' | 'pickup' | 'both';
  location?: string;
  inStock?: boolean;
}

export default function MarketplaceMetaDisplay({
  price,
  originalPrice,
  currency = 'VND',
  condition,
  category,
  pickupMethod,
  location,
  inStock = true,
}: MarketplaceMetaDisplayProps) {
  const conditionConfig = {
    new: { label: 'Mới 100%', color: 'bg-emerald-100 text-emerald-700' },
    'like-new': { label: 'Như mới', color: 'bg-green-100 text-green-700' },
    good: { label: 'Tốt', color: 'bg-blue-100 text-blue-700' },
    fair: { label: 'Khá', color: 'bg-yellow-100 text-yellow-700' },
  };

  const pickupConfig = {
    delivery: { label: 'Giao hàng', icon: '🚚' },
    pickup: { label: 'Tự lấy', icon: '🏪' },
    both: { label: 'Cả hai', icon: '📦' },
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <div className="space-y-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1 text-2xl font-bold text-cyan-700">
            <span>{formatPrice(price)}</span>
            <span className="text-sm font-normal">{currency}</span>
          </div>
          {originalPrice && originalPrice > price && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
              <Badge className="bg-red-500 text-white">
                -{discount}%
              </Badge>
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div>
          {inStock ? (
            <span className="text-sm text-green-600 font-medium">✓ Còn hàng</span>
          ) : (
            <span className="text-sm text-red-600 font-medium">✗ Hết hàng</span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2">
          {condition && (
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-cyan-600" />
              <Badge variant="outline" className={`text-xs ${conditionConfig[condition].color}`}>
                {conditionConfig[condition].label}
              </Badge>
            </div>
          )}
          {category && (
            <div className="flex items-center gap-1.5">
              <TagIcon className="h-4 w-4 text-cyan-600" />
              <span className="text-sm text-gray-700">{category}</span>
            </div>
          )}
        </div>

        {/* Pickup & Location */}
        {(pickupMethod || location) && (
          <div className="pt-2 border-t border-cyan-200 space-y-2">
            {pickupMethod && (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-cyan-600" />
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                  {pickupConfig[pickupMethod].icon} {pickupConfig[pickupMethod].label}
                </Badge>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
