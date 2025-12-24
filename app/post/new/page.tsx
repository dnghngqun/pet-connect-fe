'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  ImagePlus,
  X,
  Loader2,
  MapPin,
  PawPrint,
  FileText,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import petPostService from '@/services/petPostService';
import locationService from '@/services/locationService';
import authService from '@/services/authService';

// Step configuration
const STEPS = [
  { id: 1, title: 'Loại bài đăng', icon: FileText },
  { id: 2, title: 'Thông tin bài viết', icon: FileText },
  { id: 3, title: 'Thú cưng', icon: PawPrint },
  { id: 4, title: 'Hình ảnh', icon: ImageIcon },
];

const POST_STATUS = [
  { value: 'LOST', label: 'Thất lạc', description: 'Thú cưng của bạn bị mất', color: 'border-red-500 bg-red-50' },
  { value: 'FOUND', label: 'Tìm thấy', description: 'Bạn tìm thấy thú cưng lạc', color: 'border-blue-500 bg-blue-50' },
  { value: 'FOR_ADOPTION', label: 'Cần nhà', description: 'Tìm người nhận nuôi', color: 'border-green-500 bg-green-50' },
  { value: 'RESCUE', label: 'Cứu hộ', description: 'Thú cưng cần được cứu hộ', color: 'border-orange-500 bg-orange-50' },
];

const PET_SIZES = [
  { value: 'SMALL', label: 'Nhỏ (< 5kg)' },
  { value: 'MEDIUM', label: 'Vừa (5-15kg)' },
  { value: 'LARGE', label: 'Lớn (> 15kg)' },
];

const PET_GENDERS = [
  { value: 'MALE', label: 'Đực' },
  { value: 'FEMALE', label: 'Cái' },
];

export default function NewPostPage() {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    petType: '',
    status: '',
    city: '',
    district: '',
    location: '',
    // Pet details (matches DB: pets table)
    petName: '',       // name
    petBreed: '',      // breed
    petAge: '',        // age (months)
    petGender: '',     // gender: MALE | FEMALE
    petColor: '',      // color
    petSize: '',       // size: SMALL | MEDIUM | LARGE
    petWeight: '',     // weight
    isNeutered: false, // is_neutered
    isVaccinated: false, // is_vaccinated
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [petTypes] = useState(['Chó', 'Mèo', 'Chim', 'Hamster', 'Thỏ', 'Khác']);
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(!!user);
    setIsCheckingAuth(false);
    
    // Load cities
    locationService.getCities()
      .then(res => setCities(res.data || []))
      .catch(() => setCities(['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']));
  }, []);
  
  useEffect(() => {
    if (formData.city) {
      locationService.getDistricts(formData.city)
        .then(res => setDistricts(res.data || []))
        .catch(() => setDistricts([]));
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.city]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.status) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn loại bài đăng', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        if (!formData.title.trim()) {
          toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề', variant: 'destructive' });
          return false;
        }
        if (!formData.petType) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn loại thú cưng', variant: 'destructive' });
          return false;
        }
        if (!formData.city) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn thành phố', variant: 'destructive' });
          return false;
        }
        if (!formData.description.trim() || formData.description.length < 20) {
          toast({ title: 'Lỗi', description: 'Mô tả phải có ít nhất 20 ký tự', variant: 'destructive' });
          return false;
        }
        return true;
      case 3:
        // Pet info is optional
        return true;
      case 4:
        if (images.length === 0) {
          toast({ title: 'Lỗi', description: 'Vui lòng thêm ít nhất 1 ảnh', variant: 'destructive' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.status;
      case 2:
        return !!(formData.title && formData.petType && formData.city && formData.description.length >= 20);
      case 3:
        return true; // Optional step
      case 4:
        return images.length > 0;
      default:
        return false;
    }
  };
  
  const goToNextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Mock image upload
  const handleImageUpload = async () => {
    if (images.length >= 5) {
      toast({
        title: 'Giới hạn ảnh',
        description: 'Bạn chỉ có thể tải tối đa 5 ảnh',
        variant: 'destructive',
      });
      return;
    }
    
    const mockImages = [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setImages(prev => [...prev, randomImage]);
    
    toast({ title: 'Thành công', description: 'Đã thêm ảnh (demo)' });
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    try {
      // Note: createPost expects (postData, images as File[])
      // For demo purposes, we'll call without actual File objects
      await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        petType: formData.petType,
        status: formData.status,
        city: formData.city,
        district: formData.district || '',
        location: formData.location || undefined,
        // petId can be added if pet was created separately
      });
      
      toast({
        title: 'Thành công!',
        description: 'Bài đăng đã được tạo và hiển thị công khai.',
      });
      
      router.push('/shop');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo bài đăng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isCheckingAuth) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
            <p className="text-muted-foreground mb-4">
              Bạn cần đăng nhập để đăng bài.
            </p>
            <Button onClick={() => router.push('/sign-in')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            Đăng bài mới
          </CardTitle>
          <CardDescription>
            Điền thông tin theo từng bước để đăng bài về thú cưng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all border-2',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isCompleted && 'border-green-500 bg-green-500 text-white',
                        !isActive && !isCompleted && 'border-muted bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-medium text-center max-w-[80px]',
                        isActive && 'text-primary',
                        isCompleted && 'text-green-600',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-8 md:w-16 h-1 mx-1 mt-[-24px] rounded',
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Post Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Bạn muốn đăng bài về gì?</h3>
                <p className="text-muted-foreground text-sm">Chọn loại bài đăng phù hợp</p>
              </div>
              
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {POST_STATUS.map((status) => (
                  <div key={status.value}>
                    <RadioGroupItem
                      value={status.value}
                      id={status.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={status.value}
                      className={cn(
                        'flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all',
                        'hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg',
                        formData.status === status.value && 'border-primary bg-primary/5'
                      )}
                    >
                      <span className="text-lg font-semibold mb-1">{status.label}</span>
                      <span className="text-sm text-muted-foreground">{status.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Post Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Thông tin bài đăng</h3>
                <p className="text-muted-foreground text-sm">Nhập thông tin chính về bài đăng</p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ví dụ: Chó Husky mất tích tại Q.1, TP.HCM"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Pet Type */}
              <div className="space-y-2">
                <Label>Loại thú cưng *</Label>
                <Select
                  value={formData.petType}
                  onValueChange={(value) => handleSelectChange('petType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại thú cưng" />
                  </SelectTrigger>
                  <SelectContent>
                    {petTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thành phố *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleSelectChange('city', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => handleSelectChange('district', value)}
                    disabled={!formData.city}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Detailed Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Địa chỉ chi tiết (tùy chọn)
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ví dụ: Gần công viên Tao Đàn, đường Nguyễn Du"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết * (tối thiểu 20 ký tự)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Mô tả về thú cưng, tình trạng hiện tại, đặc điểm nhận dạng..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="resize-none"
                />
                <p className={cn(
                  "text-xs",
                  formData.description.length >= 20 ? "text-green-600" : "text-muted-foreground"
                )}>
                  {formData.description.length}/20 ký tự tối thiểu
                  {formData.description.length >= 20 && " ✓"}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Pet Details (Optional) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Thông tin thú cưng</h3>
                <p className="text-muted-foreground text-sm">
                  Thông tin chi tiết giúp tăng khả năng tìm kiếm (không bắt buộc)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border mb-6">
                <p className="text-sm text-muted-foreground">
                  💡 Bạn có thể bỏ qua bước này nếu không có đủ thông tin
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petName">Tên thú cưng</Label>
                  <Input
                    id="petName"
                    name="petName"
                    placeholder="Ví dụ: Max, Miu..."
                    value={formData.petName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petBreed">Giống (breed)</Label>
                  <Input
                    id="petBreed"
                    name="petBreed"
                    placeholder="Ví dụ: Husky, Poodle..."
                    value={formData.petBreed}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petAge">Tuổi (tháng)</Label>
                  <Input
                    id="petAge"
                    name="petAge"
                    type="number"
                    placeholder="24"
                    value={formData.petAge}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={formData.petGender}
                    onValueChange={(value) => handleSelectChange('petGender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kích thước</Label>
                  <Select
                    value={formData.petSize}
                    onValueChange={(value) => handleSelectChange('petSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_SIZES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petColor">Màu lông</Label>
                  <Input
                    id="petColor"
                    name="petColor"
                    placeholder="Ví dụ: Trắng xám..."
                    value={formData.petColor}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petWeight">Cân nặng (kg)</Label>
                  <Input
                    id="petWeight"
                    name="petWeight"
                    type="number"
                    placeholder="5"
                    value={formData.petWeight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Thêm hình ảnh</h3>
                <p className="text-muted-foreground text-sm">
                  Thêm ảnh để mọi người dễ nhận diện thú cưng
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Hình ảnh * (tối đa 5 ảnh)</span>
                <span className={cn(
                  "text-sm",
                  images.length > 0 ? "text-green-600" : "text-muted-foreground"
                )}>
                  {images.length}/5 ảnh
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Hình ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                ))}
                
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                  >
                    <ImagePlus className="h-10 w-10 mb-2" />
                    <span className="text-sm font-medium">Thêm ảnh</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                * Ảnh đầu tiên sẽ được dùng làm ảnh đại diện cho bài đăng
              </p>

              {/* Summary */}
              {images.length > 0 && (
                <div className="mt-8 p-4 bg-muted/50 rounded-xl border">
                  <h4 className="font-semibold mb-3">Tóm tắt bài đăng</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Loại:</span> {POST_STATUS.find(s => s.value === formData.status)?.label}</div>
                    <div><span className="text-muted-foreground">Thú cưng:</span> {formData.petType}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Tiêu đề:</span> {formData.title}</div>
                    <div><span className="text-muted-foreground">Vị trí:</span> {formData.district ? `${formData.district}, ${formData.city}` : formData.city}</div>
                    <div><span className="text-muted-foreground">Số ảnh:</span> {images.length}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep > 1 ? goToPrevStep : () => router.push('/shop')}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {currentStep > 1 ? 'Quay lại' : 'Hủy'}
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canGoNext()}
              >
                Tiếp theo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canGoNext()}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Đăng bài
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
