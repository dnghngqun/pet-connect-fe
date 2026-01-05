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
  Heart,
  Plus,
  Trash2,
  Syringe,
  Star,
  DollarSign,
  MessageSquare,
  Info,
} from 'lucide-react';
import petPostService from '@/services/petPostService';
import locationService from '@/services/locationService';
import authService from '@/services/authService';
import ImageCropper from '@/components/image-cropper';

// Step configuration
const STEPS = [
  { id: 1, title: 'Loại bài', icon: FileText },
  { id: 2, title: 'Nội dung chính', icon: MessageSquare },
  { id: 3, title: 'Thú cưng', icon: PawPrint },
  { id: 4, title: 'Hồ sơ y tế', icon: Heart },
  { id: 5, title: 'Hình ảnh', icon: ImageIcon },
];

const STATUS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  LOST_FOUND: [
    { value: 'LOST', label: 'Thất lạc' },
    { value: 'FOUND', label: 'Tìm thấy' },
  ],
  ADOPTION: [
    { value: 'FOR_ADOPTION', label: 'Cần nhà' },
    { value: 'RESCUE', label: 'Cứu hộ' },
  ],
};

const PET_SIZES = [
  { value: 'SMALL', label: 'Nhỏ (< 5kg)' },
  { value: 'MEDIUM', label: 'Vừa (5-15kg)' },
  { value: 'LARGE', label: 'Lớn (> 15kg)' },
];

const PET_GENDERS = [
  { value: 'MALE', label: 'Đực' },
  { value: 'FEMALE', label: 'Cái' },
];

interface NewPostPageProps {
  presetType?: string;
}

export default function NewPostPage({ presetType }: NewPostPageProps) {
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
    postType: 'LOST_FOUND',
    tagsInput: '',
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
    personality: [] as string[], // personality traits
    specialNeeds: '',  // special needs
    bio: '',           // bio
  });

  const [structuredMeta, setStructuredMeta] = useState({
    lastSeenLocation: '',
    reward: '',
    distinguishingMarks: '',
    adoptionRequirements: '',
    contact: '',
    vaccinationStatus: '',
    placeName: '',
    serviceType: '',
    rating: '',
    priceRange: '',
    address: '',
    pros: '',
    cons: '',
    questionTopic: '',
    context: '',
    tipTopic: '',
    breedingRequirements: '',
    marketplaceItemName: '',
    marketplaceCondition: '',
    marketplacePrice: '',
    marketplacePickup: '',
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [enableLocation, setEnableLocation] = useState(false);
  const [petTypes] = useState(['Chó', 'Mèo', 'Chim', 'Hamster', 'Thỏ', 'Khác']);
  const requiresPetInfo = ['LOST_FOUND', 'ADOPTION', 'BREEDING'].includes(formData.postType);
  const shouldShowPetSteps = formData.postType === 'LOST_FOUND' || formData.postType === 'ADOPTION' || formData.postType === 'BREEDING';
  
  // Health record state (optional)
  const [healthRecord, setHealthRecord] = useState({
    notes: '',
    allergies: [] as string[],
    weight: '',
    vaccinations: [] as Array<{ name: string; date: string; nextDueDate?: string }>,
    medicalHistory: [] as Array<{ condition: string; treatment: string; date: string; notes?: string; weight?: string }>,
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '', nextDueDate: '' });
  const [newMedical, setNewMedical] = useState({ condition: '', treatment: '', date: '', notes: '', weight: '' });
  
  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(!!user);
    setIsCheckingAuth(false);
    if (presetType) {
      setFormData((prev) => ({ ...prev, postType: presetType }));
    }
    
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

  useEffect(() => {
    const statuses = STATUS_BY_TYPE[formData.postType];
    if (!statuses) {
      if (formData.status) {
        setFormData(prev => ({ ...prev, status: '' }));
      }
      return;
    }
    if (!statuses.some((s) => s.value === formData.status)) {
      setFormData(prev => ({ ...prev, status: statuses[0]?.value || '' }));
    }
  }, [formData.postType]);

  useEffect(() => {
    if (!requiresPetInfo) {
      setFormData((prev) => ({ ...prev, petType: prev.petType || 'Khác' }));
    }
  }, [requiresPetInfo]);
  
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
        if (!formData.postType) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn kiểu bài (mạng xã hội)', variant: 'destructive' });
          return false;
        }
        return true;
      case 2: {
        const needsLocation = requiresPetInfo || enableLocation;
        if ((formData.postType === 'LOST_FOUND' || formData.postType === 'ADOPTION') && !formData.status) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn trạng thái phù hợp với loại bài', variant: 'destructive' });
          return false;
        }
        if (!formData.title.trim()) {
          toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề', variant: 'destructive' });
          return false;
        }
        if (requiresPetInfo && !formData.petType) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn loại thú cưng', variant: 'destructive' });
          return false;
        }
        if (needsLocation && !formData.city) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn thành phố', variant: 'destructive' });
          return false;
        }
        if (!formData.description.trim() || formData.description.length < 20) {
          toast({ title: 'Lỗi', description: 'Mô tả phải có ít nhất 20 ký tự', variant: 'destructive' });
          return false;
        }
        return true;
      }
      case 3:
        // Pet info optional for social posts, required block already handled above
        return true;
      case 4:
        // Health record is optional
        return true;
      case 5:
        if (imageFiles.length === 0) {
          toast({ title: 'Lỗi', description: 'Vui lòng thêm ít nhất 1 ảnh', variant: 'destructive' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  
  const canGoNext = (): boolean => {
    const requiresStatus = !!STATUS_BY_TYPE[formData.postType];
    const needsLocation = requiresPetInfo || enableLocation;
    switch (currentStep) {
      case 1:
        return !!formData.postType;
      case 2:
        return !!(
          formData.title &&
          formData.description.length >= 20 &&
          (!requiresPetInfo || !!formData.petType) &&
          (!needsLocation || !!formData.city) &&
          (!requiresStatus || !!formData.status)
        );
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step (health record)
      case 5:
        return imageFiles.length > 0;
      default:
        return false;
    }
  };
  
  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 2 && !shouldShowPetSteps) {
      setCurrentStep(5);
      return;
    }
    if (currentStep === 3 && !shouldShowPetSteps) {
      setCurrentStep(5);
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep === 5 && !shouldShowPetSteps) {
      setCurrentStep(2);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Real image upload handler - opens cropper for each image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (imageFiles.length >= 5) {
      toast({
        title: 'Giới hạn ảnh',
        description: 'Bạn chỉ có thể tải tối đa 5 ảnh',
        variant: 'destructive',
      });
      return;
    }
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: `${file.name} không phải là file ảnh`,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi', 
        description: `${file.name} vượt quá 5MB`,
        variant: 'destructive',
      });
      return;
    }
    
    // Open cropper
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCropperOpen(true);
    
    // Reset input
    e.target.value = '';
  };
  
  // Handle cropped image
  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `cropped_${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    
    const previewUrl = URL.createObjectURL(croppedBlob);
    
    setImageFiles(prev => [...prev, croppedFile]);
    setImagePreviews(prev => [...prev, previewUrl]);
    
    // Clean up original image URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop('');
    }
    
    toast({ title: 'Thành công', description: 'Đã thêm ảnh' });
  };
  
  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const resolveStatus = () => {
    if (formData.status) return formData.status;
    if (formData.postType === 'LOST_FOUND') return 'LOST';
    if (formData.postType === 'ADOPTION') return 'FOR_ADOPTION';
    if (formData.postType === 'RESCUE') return 'RESCUE';
    // Neutral status for social-style posts
    return 'GENERAL';
  };

  const buildMeta = () => {
    switch (formData.postType) {
      case 'LOST_FOUND':
        return {
          lastSeenLocation: structuredMeta.lastSeenLocation,
          contact: structuredMeta.contact,
          reward: structuredMeta.reward,
          distinguishingMarks: structuredMeta.distinguishingMarks,
        };
      case 'ADOPTION':
        return {
          adoptionRequirements: structuredMeta.adoptionRequirements,
          contact: structuredMeta.contact,
          vaccinationStatus: structuredMeta.vaccinationStatus,
        };
      case 'REVIEW':
        return {
          placeName: structuredMeta.placeName,
          serviceType: structuredMeta.serviceType,
          rating: structuredMeta.rating ? Number(structuredMeta.rating) : undefined,
          priceRange: structuredMeta.priceRange,
          address: structuredMeta.address,
          pros: structuredMeta.pros,
          cons: structuredMeta.cons,
        };
      case 'QNA':
        return {
          questionTopic: structuredMeta.questionTopic,
          context: structuredMeta.context,
        };
      case 'TIP':
        return {
          topic: structuredMeta.tipTopic,
          context: structuredMeta.context,
        };
      case 'BREEDING':
        return {
          requirements: structuredMeta.breedingRequirements,
          contact: structuredMeta.contact,
        };
      case 'MARKETPLACE':
        return {
          itemName: structuredMeta.marketplaceItemName,
          condition: structuredMeta.marketplaceCondition,
          price: structuredMeta.marketplacePrice,
          pickupMethod: structuredMeta.marketplacePickup,
          contact: structuredMeta.contact,
        };
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    try {
      // Build health record data if any field is filled
      
      // Construct Pet Info object
      const petInfo = {
        name: formData.petName,
        breed: formData.petBreed,
        age: formData.petAge ? parseInt(formData.petAge) : undefined,
        gender: formData.petGender, // MALE/FEMALE
        color: formData.petColor,
        size: formData.petSize, // SMALL/MEDIUM/LARGE
        weight: formData.petWeight ? parseFloat(formData.petWeight) : undefined,
        isNeutered: formData.isNeutered,
        isVaccinated: formData.isVaccinated,
        personality: formData.personality.length > 0 ? formData.personality : undefined,
        specialNeeds: formData.specialNeeds || undefined,
        bio: formData.bio || undefined,
      };

      // Construct Health Record object if any data exists
      const hasHealthData = 
        healthRecord.allergies.length > 0 ||
        healthRecord.vaccinations.length > 0 ||
        healthRecord.medicalHistory.length > 0 ||
        healthRecord.weight ||
        healthRecord.notes;

      const healthRecordData = hasHealthData ? {
          weight: healthRecord.weight ? parseFloat(healthRecord.weight) : undefined,
          allergies: healthRecord.allergies.length > 0 ? healthRecord.allergies : undefined,
          notes: healthRecord.notes || undefined,
          vaccinations: healthRecord.vaccinations.length > 0 ? healthRecord.vaccinations.map(v => ({
            name: v.name,
            date: v.date
          })) : undefined,
          medicalHistory: healthRecord.medicalHistory.length > 0 ? healthRecord.medicalHistory.map(m => ({
            condition: m.condition,
            treatment: m.treatment,
            date: m.date
          })) : undefined,
      } : undefined;

      const tags = formData.tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const meta = buildMeta();
      const status = resolveStatus();
      const petTypeToSend = requiresPetInfo ? formData.petType : (formData.petType || 'Khác');
      const cityToSend = formData.city || 'Online';

      await petPostService.createPost({
        title: formData.title,
        description: formData.description,
        petType: petTypeToSend,
        status,
        postType: formData.postType,
        city: cityToSend,
        district: formData.district || '',
        location: formData.location || undefined,
        tags: tags.length ? tags : undefined,
        meta,
        pet: petInfo, // Key fix: Sending 'pet' object with mapped fields
        healthRecord: healthRecordData,
      }, imageFiles);
      
      toast({
        title: 'Thành công!',
        description: 'Bài đăng đã được tạo và hiển thị công khai.',
      });
      
      router.push('/');
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
        <Link href="/">
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
              <p className="text-muted-foreground text-sm">Chọn kiểu bài đăng (trạng thái sẽ chọn ở bước sau nếu cần).</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Kiểu bài (postType)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { value: 'LOST_FOUND', label: 'Lost/Found', desc: 'Thông báo thất lạc / tìm thấy' },
                    { value: 'ADOPTION', label: 'Adoption/Rescue', desc: 'Nhận nuôi / Cứu hộ' },
                    { value: 'REVIEW', label: 'Review', desc: 'Đánh giá dịch vụ/nơi chốn' },
                    { value: 'QNA', label: 'Hỏi đáp', desc: 'Đặt câu hỏi cho cộng đồng' },
                    { value: 'TIP', label: 'Mẹo', desc: 'Chia sẻ kinh nghiệm chăm thú' },
                    { value: 'BREEDING', label: 'Breeding', desc: 'Giao phối/nhân giống' },
                    { value: 'MARKETPLACE', label: 'Marketplace', desc: 'Phụ kiện/thức ăn' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleSelectChange('postType', type.value)}
                      className={cn(
                        'p-3 rounded-lg border text-left hover:border-primary transition',
                        formData.postType === type.value ? 'border-primary bg-primary/5' : 'border-muted'
                      )}
                    >
                      <p className="font-semibold">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Post Details */}
          {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Thông tin bài đăng</h3>
              <p className="text-muted-foreground text-sm">
                {requiresPetInfo
                  ? 'Nội dung sẽ hiển thị trên bảng tin (giống post Facebook).'
                  : 'Bài chia sẻ/review không cần thông tin thú cưng, bỏ qua bước 3-4.'}
              </p>
            </div>

            {/* Status (only for LOST_FOUND / ADOPTION) */}
            {STATUS_BY_TYPE[formData.postType] && (
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {STATUS_BY_TYPE[formData.postType].map((item) => (
                    <div key={item.value} className="border rounded-lg p-3 flex items-center gap-3">
                      <RadioGroupItem value={item.value} id={`status-${item.value}`} />
                      <Label htmlFor={`status-${item.value}`} className="cursor-pointer font-medium">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

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

            {/* Tags */}
            <div className="space-y-2">
              <Label>Hashtag/Tag</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tag, cách nhau bởi dấu phẩy (vd: lost,husky,urgent)"
                  value={formData.tagsInput}
                  onChange={(e) => handleSelectChange('tagsInput', e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Dùng tag để lọc và gợi ý nội dung</p>
            </div>

            {/* Dynamic meta fields */}
            {formData.postType === 'LOST_FOUND' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vị trí thấy lần cuối</Label>
                  <Input
                    placeholder="Công viên Tao Đàn..."
                    value={structuredMeta.lastSeenLocation}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phần thưởng (nếu có)</Label>
                  <Input
                    placeholder="500,000 VND"
                    value={structuredMeta.reward}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, reward: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Dấu hiệu nhận dạng</Label>
                  <Input
                    placeholder="Vòng cổ xanh, sẹo nhỏ trên tai..."
                    value={structuredMeta.distinguishingMarks}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, distinguishingMarks: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Liên hệ</Label>
                  <Input
                    placeholder="SĐT / Zalo / FB"
                    value={structuredMeta.contact}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'ADOPTION' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Yêu cầu nhận nuôi</Label>
                  <Textarea
                    placeholder="Có sân vườn, cam kết tiêm vaccine..."
                    value={structuredMeta.adoptionRequirements}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, adoptionRequirements: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tình trạng tiêm phòng</Label>
                  <Input
                    placeholder="Đã tiêm 2 mũi"
                    value={structuredMeta.vaccinationStatus}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, vaccinationStatus: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Liên hệ</Label>
                  <Input
                    placeholder="SĐT / Zalo / FB"
                    value={structuredMeta.contact}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'REVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên địa điểm</Label>
                  <Input
                    placeholder="PetCare Clinic"
                    value={structuredMeta.placeName}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, placeName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loại dịch vụ</Label>
                  <Input
                    placeholder="Phòng khám / Khách sạn / Spa..."
                    value={structuredMeta.serviceType}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, serviceType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Đánh giá sao</Label>
                  <div className="flex gap-2 items-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      value={structuredMeta.rating}
                      onChange={(e) => setStructuredMeta(prev => ({ ...prev, rating: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Khoảng giá</Label>
                  <div className="flex gap-2 items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="300k - 500k"
                      value={structuredMeta.priceRange}
                      onChange={(e) => setStructuredMeta(prev => ({ ...prev, priceRange: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    placeholder="123 Nguyễn Trãi, Q5, HCM"
                    value={structuredMeta.address}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ưu điểm</Label>
                  <Textarea
                    placeholder="Nhân viên thân thiện, sạch sẽ..."
                    value={structuredMeta.pros}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, pros: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nhược điểm</Label>
                  <Textarea
                    placeholder="Giá hơi cao..."
                    value={structuredMeta.cons}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, cons: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'QNA' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Chủ đề câu hỏi</Label>
                  <Input
                    placeholder="Biểu hiện khi mèo động dục?"
                    value={structuredMeta.questionTopic}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, questionTopic: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngữ cảnh / mô tả</Label>
                  <Textarea
                    placeholder="Mèo cái 8 tháng, dạo này kêu nhiều..."
                    value={structuredMeta.context}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, context: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'TIP' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Chủ đề mẹo</Label>
                  <Input
                    placeholder="Chăm sóc lông mùa nóng"
                    value={structuredMeta.tipTopic}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, tipTopic: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngữ cảnh / mô tả</Label>
                  <Textarea
                    placeholder="Chia sẻ cách tắm nhanh, sấy lông..."
                    value={structuredMeta.context}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, context: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'BREEDING' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Yêu cầu phối giống</Label>
                  <Textarea
                    placeholder="Cần tìm partner giống corgi, tiêm đủ vaccine..."
                    value={structuredMeta.breedingRequirements}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, breedingRequirements: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Liên hệ</Label>
                  <Input
                    placeholder="SĐT / Zalo / FB"
                    value={structuredMeta.contact}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.postType === 'MARKETPLACE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên sản phẩm</Label>
                  <Input
                    placeholder="Cây trèo mèo cũ"
                    value={structuredMeta.marketplaceItemName}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplaceItemName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tình trạng</Label>
                  <Input
                    placeholder="95% mới"
                    value={structuredMeta.marketplaceCondition}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplaceCondition: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá</Label>
                  <Input
                    placeholder="500,000 VND"
                    value={structuredMeta.marketplacePrice}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplacePrice: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cách nhận hàng</Label>
                  <Input
                    placeholder="Ship / gặp trực tiếp"
                    value={structuredMeta.marketplacePickup}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplacePickup: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Liên hệ</Label>
                  <Input
                    placeholder="SĐT / Zalo / FB"
                    value={structuredMeta.contact}
                    onChange={(e) => setStructuredMeta(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
              </div>
            )}

              {/* Pet Type */}
              {requiresPetInfo && (
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
              )}

              {/* Location */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                {!requiresPetInfo && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Thêm địa điểm cho bài chia sẻ?</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEnableLocation((v) => !v)}
                    >
                      {enableLocation ? 'Ẩn địa điểm' : 'Thêm địa điểm'}
                    </Button>
                  </div>
                )}
                {(requiresPetInfo || enableLocation) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{requiresPetInfo ? 'Thành phố *' : 'Thành phố (tuỳ chọn)'}</Label>
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
                  </>
                )}
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
          {currentStep === 3 && shouldShowPetSteps && (
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

              {/* Special Needs */}
              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Nhu cầu đặc biệt</Label>
                <Input
                  id="specialNeeds"
                  name="specialNeeds"
                  placeholder="Ví dụ: Cần chế độ ăn đặc biệt..."
                  value={formData.specialNeeds}
                  onChange={handleChange}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Mô tả về thú cưng (Bio)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Mô tả thêm về tính cách, thói quen của thú cưng..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Health Record (Optional) */}
          {currentStep === 4 && shouldShowPetSteps && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Hồ sơ y tế</h3>
                <p className="text-muted-foreground text-sm">
                  Thêm thông tin sức khỏe để người nhận nuôi biết rõ hơn (không bắt buộc)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border mb-6">
                <p className="text-sm text-muted-foreground">
                  💡 Bước này không bắt buộc. Bạn có thể bỏ qua hoặc thêm sau.
                </p>
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Dị ứng</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Nhập loại dị ứng..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAllergy.trim()) {
                        e.preventDefault();
                        setHealthRecord(prev => ({
                          ...prev,
                          allergies: [...prev.allergies, newAllergy.trim()]
                        }));
                        setNewAllergy('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newAllergy.trim()) {
                        setHealthRecord(prev => ({
                          ...prev,
                          allergies: [...prev.allergies, newAllergy.trim()]
                        }));
                        setNewAllergy('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {healthRecord.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {healthRecord.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => setHealthRecord(prev => ({
                            ...prev,
                            allergies: prev.allergies.filter((_, i) => i !== idx)
                          }))}
                          className="hover:text-red-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>


              {/* Vaccinations */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  Tiêm phòng
                </Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Tên vaccine</Label>
                    <Input
                      value={newVaccine.name}
                      onChange={(e) => setNewVaccine(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tên vaccine..."
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs text-muted-foreground">Ngày tiêm</Label>
                    <Input
                      type="date"
                      value={newVaccine.date}
                      onChange={(e) => setNewVaccine(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs text-muted-foreground">Lần tới</Label>
                    <Input
                      type="date"
                      value={newVaccine.nextDueDate}
                      onChange={(e) => setNewVaccine(prev => ({ ...prev, nextDueDate: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      if (newVaccine.name.trim() && newVaccine.date) {
                        setHealthRecord(prev => ({
                          ...prev,
                          vaccinations: [...prev.vaccinations, { ...newVaccine }]
                        }));
                        setNewVaccine({ name: '', date: '', nextDueDate: '' });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {healthRecord.vaccinations.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {healthRecord.vaccinations.map((vac, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                        <div>
                          <span className="font-medium">{vac.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Ngày tiêm: {new Date(vac.date).toLocaleDateString('vi-VN')}
                          </span>
                          {vac.nextDueDate && (
                            <span className="text-sm text-muted-foreground ml-2">
                              | Lần tới: {new Date(vac.nextDueDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setHealthRecord(prev => ({
                            ...prev,
                            vaccinations: prev.vaccinations.filter((_, i) => i !== idx)
                          }))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <Label>Lịch sử khám bệnh</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newMedical.condition}
                    onChange={(e) => setNewMedical(prev => ({ ...prev, condition: e.target.value }))}
                    placeholder="Tình trạng..."
                  />
                  <Input
                    value={newMedical.treatment}
                    onChange={(e) => setNewMedical(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Điều trị..."
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-36">
                    <Label className="text-xs text-muted-foreground">Ngày khám</Label>
                    <Input
                      type="date"
                      value={newMedical.date}
                      onChange={(e) => setNewMedical(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Ghi chú (tùy chọn)</Label>
                    <Input
                      value={newMedical.notes}
                      onChange={(e) => setNewMedical(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú..."
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs text-muted-foreground">Cân nặng</Label>
                    <Input
                      type="number"
                      value={newMedical.weight}
                      onChange={(e) => setNewMedical(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="Kg"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="self-end"
                    onClick={() => {
                      if (newMedical.condition.trim() && newMedical.treatment.trim()) {
                        setHealthRecord(prev => ({
                          ...prev,
                          medicalHistory: [...prev.medicalHistory, { ...newMedical }]
                        }));
                        setNewMedical({ condition: '', treatment: '', date: '', notes: '', weight: '' });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {healthRecord.medicalHistory.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {healthRecord.medicalHistory.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                        <div>
                          <span className="font-medium">{med.condition}</span>
                          <span className="text-muted-foreground"> → {med.treatment}</span>
                          {med.date && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({new Date(med.date).toLocaleDateString('vi-VN')})
                            </span>
                          )}
                          {med.weight && (
                            <span className="text-sm text-green-600 ml-2">• {med.weight} kg</span>
                          )}
                          {med.notes && (
                            <span className="text-sm text-muted-foreground ml-2">- {med.notes}</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setHealthRecord(prev => ({
                            ...prev,
                            medicalHistory: prev.medicalHistory.filter((_, i) => i !== idx)
                          }))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="healthNotes">Ghi chú sức khỏe</Label>
                <Textarea
                  id="healthNotes"
                  value={healthRecord.notes}
                  onChange={(e) => setHealthRecord(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú về tình trạng sức khỏe chung..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Images */}
          {currentStep === 5 && (
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
                  imageFiles.length > 0 ? "text-green-600" : "text-muted-foreground"
                )}>
                  {imageFiles.length}/5 ảnh
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((url, index) => (
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
                
                {imageFiles.length < 5 && (
                  <label
                    className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5 cursor-pointer"
                  >
                    <ImagePlus className="h-10 w-10 mb-2" />
                    <span className="text-sm font-medium">Thêm ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                * Ảnh đầu tiên sẽ được dùng làm ảnh đại diện cho bài đăng
              </p>

              {/* Summary */}
              {imageFiles.length > 0 && (
                <div className="mt-8 p-4 bg-muted/50 rounded-xl border">
                  <h4 className="font-semibold mb-3">Tóm tắt bài đăng</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trạng thái:</span>{' '}
                      {(() => {
                        const statusItem = Object.values(STATUS_BY_TYPE).flat().find(s => s.value === formData.status);
                        return statusItem?.label || (formData.status || 'Không yêu cầu');
                      })()}
                    </div>
                    <div><span className="text-muted-foreground">Thú cưng:</span> {formData.petType}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Tiêu đề:</span> {formData.title}</div>
                    <div><span className="text-muted-foreground">Vị trí:</span> {formData.district ? `${formData.district}, ${formData.city}` : formData.city}</div>
                    <div><span className="text-muted-foreground">Số ảnh:</span> {imageFiles.length}</div>
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
              onClick={currentStep > 1 ? goToPrevStep : () => router.push('/')}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {currentStep > 1 ? 'Quay lại' : 'Hủy'}
            </Button>

            {currentStep < 5 ? (
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

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 10}
        title="Cắt ảnh (16:10)"
      />
    </div>
  );
}
