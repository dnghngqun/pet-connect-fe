'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import petPostService from '@/services/petPostService';
import authService from '@/services/authService';
import ImageCropper from '@/components/image-cropper';

type StepKind = 'type' | 'details' | 'pet' | 'health' | 'images';

const STEP_CONFIG: Record<StepKind, { title: string; icon: LucideIcon }> = {
  type: { title: 'Loại bài', icon: FileText },
  details: { title: 'Nội dung', icon: MessageSquare },
  pet: { title: 'Thú cưng', icon: PawPrint },
  health: { title: 'Hồ sơ y tế', icon: Heart },
  images: { title: 'Hình ảnh', icon: ImageIcon },
};

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
  onPostCreated?: (post: any) => void;
  onCancel?: () => void;
}

export default function NewPostPage({ presetType, onPostCreated, onCancel }: NewPostPageProps) {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
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
    petPersonality: '', // personality traits (comma separated)
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
  const [enableLocation, setEnableLocation] = useState(false);
  const [petTypes] = useState(['Chó', 'Mèo', 'Chim', 'Hamster', 'Thỏ', 'Khác']);
  const requiresPetInfo = ['LOST_FOUND', 'ADOPTION', 'BREEDING'].includes(formData.postType);
  const shouldShowPetSteps = requiresPetInfo;
  
  // Health record state (optional)
  const [healthRecord, setHealthRecord] = useState({
    notes: '',
    allergies: [] as string[],
    weight: '',
    vaccinations: [] as Array<{ name: string; date: string }>,
    medicalHistory: [] as Array<{ condition: string; treatment: string; date: string; notes?: string }>,
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '' });
  const [newMedical, setNewMedical] = useState({ condition: '', treatment: '', date: '', notes: '' });
  
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
  }, []);
  
  const steps = useMemo<StepKind[]>(() => {
    const base: StepKind[] = ['type', 'details'];
    if (shouldShowPetSteps) {
      base.push('pet', 'health');
    }
    base.push('images');
    return base;
  }, [shouldShowPetSteps]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(Math.max(steps.length - 1, 0));
    }
  }, [steps, currentStep]);

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
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/');
    }
  };

  const validateStep = (step: StepKind): boolean => {
    switch (step) {
      case 'type':
        if (!formData.postType) {
          toast({ title: 'Lỗi', description: 'Vui lòng chọn loại bài đăng', variant: 'destructive' });
          return false;
        }
        return true;
      case 'details': {
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
        if (needsLocation && !formData.city.trim()) {
          toast({ title: 'Lỗi', description: 'Vui lòng nhập thành phố', variant: 'destructive' });
          return false;
        }
        if (formData.description.trim().length < 20) {
          toast({ title: 'Lỗi', description: 'Mô tả phải có ít nhất 20 ký tự', variant: 'destructive' });
          return false;
        }
        return true;
      }
      case 'pet':
      case 'health':
        return true;
      case 'images':
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
    const currentKind = steps[currentStep];
    switch (currentKind) {
      case 'type':
        return !!formData.postType;
      case 'details':
        return !!(
          formData.title.trim() &&
          formData.description.trim().length >= 20 &&
          (!requiresPetInfo || !!formData.petType) &&
          (!needsLocation || !!formData.city.trim()) &&
          (!requiresStatus || !!formData.status)
        );
      case 'pet':
      case 'health':
        return true;
      case 'images':
        return imageFiles.length > 0;
      default:
        return false;
    }
  };
  
  const goToNextStep = () => {
    const currentKind = steps[currentStep];
    if (!validateStep(currentKind)) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
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

  const cleanMeta = (meta: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(meta).filter(([, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'number' && Number.isNaN(value)) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      })
    );

  const buildMeta = () => {
    switch (formData.postType) {
      case 'LOST_FOUND':
        return cleanMeta({
          lastSeenLocation: structuredMeta.lastSeenLocation,
          contact: structuredMeta.contact,
          reward: structuredMeta.reward,
          distinguishingMarks: structuredMeta.distinguishingMarks,
        });
      case 'ADOPTION':
        return cleanMeta({
          adoptionRequirements: structuredMeta.adoptionRequirements,
          contact: structuredMeta.contact,
          vaccinationStatus: structuredMeta.vaccinationStatus,
        });
      case 'REVIEW':
        return cleanMeta({
          placeName: structuredMeta.placeName,
          serviceType: structuredMeta.serviceType,
          rating: structuredMeta.rating.trim()
            ? Number(structuredMeta.rating.trim())
            : undefined,
          priceRange: structuredMeta.priceRange,
          address: structuredMeta.address,
          pros: structuredMeta.pros,
          cons: structuredMeta.cons,
        });
      case 'QNA':
        return cleanMeta({
          questionTopic: structuredMeta.questionTopic,
          context: structuredMeta.context,
        });
      case 'TIP':
        return cleanMeta({
          topic: structuredMeta.tipTopic,
          context: structuredMeta.context,
        });
      case 'BREEDING':
        return cleanMeta({
          requirements: structuredMeta.breedingRequirements,
          contact: structuredMeta.contact,
        });
      case 'MARKETPLACE':
        return cleanMeta({
          itemName: structuredMeta.marketplaceItemName,
          condition: structuredMeta.marketplaceCondition,
          price: structuredMeta.marketplacePrice,
          pickupMethod: structuredMeta.marketplacePickup,
          contact: structuredMeta.contact,
        });
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('images')) return;
    
    setIsSubmitting(true);
    try {
      // Build health record data if any field is filled
      
      const personality = formData.petPersonality
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const parsedAge = formData.petAge ? Number.parseInt(formData.petAge, 10) : Number.NaN;
      const parsedPetWeight = formData.petWeight ? Number.parseFloat(formData.petWeight) : Number.NaN;
      const petInfo = {
        ...(formData.petName.trim() ? { name: formData.petName.trim() } : {}),
        ...(formData.petBreed.trim() ? { breed: formData.petBreed.trim() } : {}),
        ...(!Number.isNaN(parsedAge) ? { age: parsedAge } : {}),
        ...(formData.petGender ? { gender: formData.petGender } : {}),
        ...(formData.petColor.trim() ? { color: formData.petColor.trim() } : {}),
        ...(formData.petSize ? { size: formData.petSize } : {}),
        ...(!Number.isNaN(parsedPetWeight) ? { weight: parsedPetWeight } : {}),
        ...(formData.isNeutered ? { isNeutered: true } : {}),
        ...(formData.isVaccinated ? { isVaccinated: true } : {}),
        ...(personality.length ? { personality } : {}),
        ...(formData.specialNeeds.trim() ? { specialNeeds: formData.specialNeeds.trim() } : {}),
        ...(formData.bio.trim() ? { bio: formData.bio.trim() } : {}),
      };
      const petInfoData = Object.keys(petInfo).length ? petInfo : undefined;

      // Construct Health Record object if any data exists
      const hasHealthData = 
        healthRecord.allergies.length > 0 ||
        healthRecord.vaccinations.length > 0 ||
        healthRecord.medicalHistory.length > 0 ||
        healthRecord.weight.trim() ||
        healthRecord.notes.trim();

      const parsedHealthWeight = healthRecord.weight ? Number.parseFloat(healthRecord.weight) : Number.NaN;
      const healthRecordData = hasHealthData ? {
          weight: !Number.isNaN(parsedHealthWeight) ? parsedHealthWeight : undefined,
          allergies: healthRecord.allergies.length > 0 ? healthRecord.allergies : undefined,
          notes: healthRecord.notes.trim() ? healthRecord.notes.trim() : undefined,
          vaccinations: healthRecord.vaccinations.length > 0 ? healthRecord.vaccinations.map(v => ({
            name: v.name,
            date: v.date
          })) : undefined,
          medicalHistory: healthRecord.medicalHistory.length > 0 ? healthRecord.medicalHistory.map(m => ({
            condition: m.condition,
            treatment: m.treatment,
            date: m.date,
            notes: m.notes || undefined,
          })) : undefined,
      } : undefined;

      const tags = formData.tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const meta = buildMeta();
      const metaData = Object.keys(meta).length ? meta : undefined;
      const status = resolveStatus();
      const needsLocation = requiresPetInfo || enableLocation;
      const petTypeToSend = requiresPetInfo ? formData.petType : (formData.petType || 'Khác');
      const cityToSend = formData.city.trim() || (needsLocation ? '' : 'Online');

      const response = await petPostService.createPost({
        title: formData.title.trim(),
        description: formData.description.trim(),
        petType: petTypeToSend,
        status,
        postType: formData.postType,
        city: cityToSend,
        district: formData.district.trim() || undefined,
        location: formData.location.trim() || undefined,
        tags: tags.length ? tags : undefined,
        meta: metaData,
        pet: petInfoData,
        healthRecord: healthRecordData,
      }, imageFiles);
      
      toast({
        title: 'Thành công!',
        description: 'Bài đăng đã được tạo và hiển thị công khai.',
      });

      if (onPostCreated) {
        onPostCreated(response.data);
      } else {
        router.push('/');
      }
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

  const currentStepKey = steps[currentStep];
  const descriptionLength = formData.description.trim().length;
  
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
      {onCancel ? (
        <Button variant="ghost" className="mb-6" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      ) : (
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
      )}

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 overflow-hidden relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl" />
          <span className="absolute top-4 right-4 text-4xl opacity-10">🐾</span>
          <span className="absolute bottom-4 left-4 text-3xl opacity-10">🐕</span>
        </div>
        
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg">
              <PawPrint className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Đăng bài mới
            </span>
          </CardTitle>
          <CardDescription className="text-base mt-1">
            Điền thông tin theo từng bước để đăng bài về thú cưng 🐾
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {/* Enhanced Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-10 px-2">
            {steps.map((stepKey, index) => {
              const step = STEP_CONFIG[stepKey];
              const StepIcon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;

              return (
                <div key={stepKey} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md',
                        isActive && 'bg-gradient-to-br from-orange-400 to-pink-500 text-white scale-110 shadow-lg shadow-orange-200',
                        isCompleted && 'bg-gradient-to-br from-green-400 to-emerald-500 text-white',
                        !isActive && !isCompleted && 'bg-white/80 border-2 border-gray-200 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" strokeWidth={3} />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-semibold text-center max-w-[70px] transition-colors duration-300',
                        isActive && 'text-orange-600',
                        isCompleted && 'text-emerald-600',
                        !isActive && !isCompleted && 'text-gray-400'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-8 md:w-12 h-1.5 mx-1 mt-[-20px] rounded-full transition-all duration-500',
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Post Type */}
        {currentStepKey === 'type' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Bạn muốn đăng bài về gì? 🤔
              </h3>
              <p className="text-muted-foreground text-sm mt-1">Chọn kiểu bài đăng phù hợp với nội dung của bạn</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                  { value: 'LOST_FOUND', label: 'Thất lạc', desc: 'Thông báo thất lạc hoặc tìm thấy', emoji: '🔍', gradient: 'from-red-400 to-orange-400', bgLight: 'bg-red-50' },
                  { value: 'ADOPTION', label: 'Nhận nuôi', desc: 'Tìm chủ mới hoặc cứu hộ', emoji: '🏠', gradient: 'from-green-400 to-emerald-400', bgLight: 'bg-green-50' },
                  { value: 'REVIEW', label: 'Đánh giá', desc: 'Review dịch vụ/địa điểm', emoji: '⭐', gradient: 'from-yellow-400 to-amber-400', bgLight: 'bg-yellow-50' },
                  { value: 'QNA', label: 'Hỏi đáp', desc: 'Đặt câu hỏi cho cộng đồng', emoji: '❓', gradient: 'from-blue-400 to-cyan-400', bgLight: 'bg-blue-50' },
                  { value: 'TIP', label: 'Mẹo hay', desc: 'Chia sẻ kinh nghiệm', emoji: '💡', gradient: 'from-purple-400 to-pink-400', bgLight: 'bg-purple-50' },
                  { value: 'BREEDING', label: 'Phối giống', desc: 'Tìm đối tác phối giống', emoji: '💕', gradient: 'from-pink-400 to-rose-400', bgLight: 'bg-pink-50' },
                  { value: 'MARKETPLACE', label: 'Chợ thú cưng', desc: 'Mua bán đồ dùng', emoji: '🛒', gradient: 'from-indigo-400 to-violet-400', bgLight: 'bg-indigo-50' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleSelectChange('postType', type.value)}
                    className={cn(
                      'group relative p-5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                      formData.postType === type.value 
                        ? `${type.bgLight} ring-2 ring-offset-2 shadow-lg` 
                        : 'bg-white/70 hover:bg-white border border-gray-100 hover:shadow-md',
                      formData.postType === type.value && (type.gradient.includes('red') ? 'ring-red-400' : type.gradient.includes('green') ? 'ring-green-400' : type.gradient.includes('yellow') ? 'ring-amber-400' : type.gradient.includes('blue') ? 'ring-blue-400' : type.gradient.includes('purple') ? 'ring-purple-400' : type.gradient.includes('pink') ? 'ring-pink-400' : 'ring-indigo-400')
                    )}
                  >
                    <div className={cn(
                      'text-4xl mb-3 transition-transform duration-300 group-hover:scale-110',
                      formData.postType === type.value && 'animate-bounce'
                    )}>
                      {type.emoji}
                    </div>
                    <p className={cn(
                      'font-bold text-base mb-1 transition-colors',
                      formData.postType === type.value ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                    )}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
                    
                    {/* Selection indicator */}
                    {formData.postType === type.value && (
                      <div className={cn(
                        'absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md',
                        type.gradient
                      )}>
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Post Details */}
          {currentStepKey === 'details' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Thông tin bài đăng ✍️
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {requiresPetInfo
                  ? 'Nội dung sẽ hiển thị trên bảng tin của cộng đồng'
                  : 'Bài chia sẻ/review không cần thông tin thú cưng'}
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
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Thêm địa điểm</Label>
                      <p className="text-xs text-muted-foreground">
                        Bài chia sẻ có thể thêm địa điểm tuỳ chọn
                      </p>
                    </div>
                    <Switch
                      checked={enableLocation}
                      onCheckedChange={(checked) => setEnableLocation(checked)}
                    />
                  </div>
                )}
                {(requiresPetInfo || enableLocation) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{requiresPetInfo ? 'Thành phố *' : 'Thành phố'}</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Ví dụ: TP. Hồ Chí Minh"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">Quận/Huyện</Label>
                        <Input
                          id="district"
                          name="district"
                          placeholder="Ví dụ: Quận 1"
                          value={formData.district}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Detailed Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Địa chỉ chi tiết
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
                  maxLength={2000}
                  className="resize-none"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className={cn(
                    descriptionLength >= 20 ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {descriptionLength >= 20 ? "Đã đạt tối thiểu 20 ký tự ✓" : `Tối thiểu 20 ký tự (${descriptionLength}/20)`}
                  </span>
                  <span className={cn(
                    descriptionLength >= 2000 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {descriptionLength}/2000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pet Details (Optional) */}
          {currentStepKey === 'pet' && shouldShowPetSteps && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Thông tin thú cưng 🐾
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Thông tin chi tiết giúp bài đăng rõ ràng và đầy đủ hơn
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-6">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Bạn có thể bỏ qua bước này nếu không có đủ thông tin
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
                  <Label htmlFor="petBreed">Giống</Label>
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

              <div className="space-y-2">
                <Label htmlFor="petPersonality">Tính cách (cách nhau bởi dấu phẩy)</Label>
                <Input
                  id="petPersonality"
                  name="petPersonality"
                  placeholder="Hiền lành, hoạt bát..."
                  value={formData.petPersonality}
                  onChange={handleChange}
                />
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
                <Label htmlFor="bio">Mô tả thêm</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Mô tả thêm về tính cách, thói quen của thú cưng..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label className="text-sm font-medium">Đã triệt sản</Label>
                  <Switch
                    checked={formData.isNeutered}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isNeutered: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label className="text-sm font-medium">Đã tiêm phòng</Label>
                  <Switch
                    checked={formData.isVaccinated}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isVaccinated: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Health Record (Optional) */}
          {currentStepKey === 'health' && shouldShowPetSteps && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Hồ sơ y tế 🩺
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Thêm thông tin sức khỏe để người nhận nuôi biết rõ hơn
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 mb-6">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Bước này không bắt buộc. Bạn có thể bỏ qua hoặc thêm sau.
                </p>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="healthWeight">Cân nặng (kg)</Label>
                <Input
                  id="healthWeight"
                  type="number"
                  value={healthRecord.weight}
                  onChange={(e) => setHealthRecord(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="5"
                  step="0.1"
                  min="0"
                />
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
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      const name = newVaccine.name.trim();
                      if (name && newVaccine.date) {
                        setHealthRecord(prev => ({
                          ...prev,
                          vaccinations: [...prev.vaccinations, { name, date: newVaccine.date }]
                        }));
                        setNewVaccine({ name: '', date: '' });
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
                  <Button
                    type="button"
                    size="icon"
                    className="self-end"
                    onClick={() => {
                      if (newMedical.condition.trim() && newMedical.treatment.trim() && newMedical.date) {
                        setHealthRecord(prev => ({
                          ...prev,
                          medicalHistory: [...prev.medicalHistory, { ...newMedical }]
                        }));
                        setNewMedical({ condition: '', treatment: '', date: '', notes: '' });
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
          {currentStepKey === 'images' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Thêm hình ảnh 📸
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Thêm ảnh để mọi người dễ nhận diện thú cưng
                </p>
              </div>

              <div className="flex items-center justify-between mb-4 px-1">
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
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep > 0 ? goToPrevStep : handleCancel}
              disabled={isSubmitting}
              className="rounded-xl px-6 border-gray-200 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {currentStep > 0 ? 'Quay lại' : 'Hủy'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canGoNext()}
                className="rounded-xl px-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-200/50 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Tiếp theo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canGoNext()}
                className="min-w-[160px] rounded-xl px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200/50 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Đăng bài 🎉
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
