'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { X, Upload, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import petPostService from '@/services/petPostService';
import authService from '@/services/authService';
import Image from 'next/image';
type StepKind = 'type' | 'details' | 'pet' | 'health' | 'images';

const POST_TYPES = [
  { value: 'LOST_FOUND', label: 'Thất lạc/Tìm thấy', emoji: '🔍', description: 'Thông báo thất lạc hoặc tìm thấy thú cưng' },
  { value: 'ADOPTION', label: 'Nhận nuôi/Cứu hộ', emoji: '🏠', description: 'Tìm chủ mới hoặc cứu hộ' },
  { value: 'REVIEW', label: 'Đánh giá', emoji: '⭐', description: 'Review dịch vụ/địa điểm' },
  { value: 'QNA', label: 'Hỏi đáp', emoji: '❓', description: 'Đặt câu hỏi cho cộng đồng' },
  { value: 'TIP', label: 'Mẹo hay', emoji: '💡', description: 'Chia sẻ kinh nghiệm chăm sóc' },
  { value: 'BREEDING', label: 'Phối giống', emoji: '💕', description: 'Tìm phối giống' },
  { value: 'MARKETPLACE', label: 'Chợ thú cưng', emoji: '🛒', description: 'Mua bán/phụ kiện' },
];

const PET_TYPES = ['Chó', 'Mèo', 'Chim', 'Hamster', 'Thỏ', 'Khác'];
const PET_GENDERS = [
  { value: 'MALE', label: 'Đực' },
  { value: 'FEMALE', label: 'Cái' },
];

const PET_SIZES = [
  { value: 'SMALL', label: 'Nhỏ (< 5kg)' },
  { value: 'MEDIUM', label: 'Vừa (5-15kg)' },
  { value: 'LARGE', label: 'Lớn (> 15kg)' },
];

interface CompactPostWizardProps {
  presetType?: string;
  onPostCreated?: (post: any) => void;
  onCancel?: () => void;
  initialPost?: any;
  isEditing?: boolean;
}

export default function CompactPostWizard({
  presetType,
  onPostCreated,
  onCancel,
  initialPost,
  isEditing = false,
}: CompactPostWizardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    postType: presetType || 'LOST_FOUND',
    title: '',
    description: '',
    petType: 'Chó',
    status: 'LOST',
    city: '',
    district: '',
    location: '',

    petName: '',
    petBreed: '',
    petAge: '',
    petGender: '',
    petColor: '',
    petWeight: '',
    isNeutered: false,
    isVaccinated: false,

    petSize: '', 
    petPersonality: '',
    petSpecialNeeds: '',
    petBio: '',

    healthWeight: '',
    healthNotes: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [enableLocation, setEnableLocation] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  
  const [vaccinations, setVaccinations] = useState<Array<{name: string; date: string}>>([]);
  const [vaccineInput, setVaccineInput] = useState({name: '', date: ''});
  
  const [medicalHistory, setMedicalHistory] = useState<Array<{condition: string; treatment: string; date: string; notes?: string}>>([]);
  const [medicalInput, setMedicalInput] = useState({condition: '', treatment: '', date: '', notes: ''});

  const [structuredMeta, setStructuredMeta] = useState({

    lastSeenLocation: '',
    reward: '',
    distinguishingMarks: '',
    lostFoundContact: '',

    adoptionRequirements: '',
    vaccinationStatus: '',
    adoptionContact: '',

    placeName: '',
    serviceType: '',
    rating: '',
    priceRange: '',
    address: '',
    pros: '',
    cons: '',

    questionTopic: '',
    qnaContext: '',

    tipTopic: '',
    tipContext: '',

    breedingRequirements: '',
    breedingContact: '',

    marketplaceItemName: '',
    marketplaceCondition: '',
    marketplacePrice: '',
    marketplacePickup: '',
    marketplaceContact: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const requiresPetInfo = ['LOST_FOUND', 'ADOPTION', 'BREEDING'].includes(formData.postType);

  const steps = useMemo<StepKind[]>(() => {
    const base: StepKind[] = isEditing ? ['details'] : ['type', 'details'];
    if (requiresPetInfo) {
      base.push('pet', 'health');
    }
    base.push('images');
    return base;
  }, [formData.postType, requiresPetInfo, isEditing]);
  const progressAfterTypeSelection = currentStep > 0 
    ? ((currentStep) / (steps.length - 1)) * 100 
    : 0;

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user && onCancel) onCancel();
  }, [onCancel]);
  useEffect(() => {
    if (isEditing && initialPost) {
      setFormData(prev => ({
        ...prev,
        postType: initialPost.postType || prev.postType,
        title: initialPost.title || '',
        description: initialPost.description || '',
        petType: initialPost.petType || 'Chó',
        status: initialPost.status || 'GENERAL',
        city: initialPost.city || '',
        district: initialPost.district || '',
        location: initialPost.location || '',

        petName: initialPost.pet?.name || '',
        petBreed: initialPost.pet?.breed || '',
        petAge: initialPost.pet?.age?.toString() || '',
        petGender: initialPost.pet?.gender || '',
        petColor: initialPost.pet?.color || '',
        petWeight: initialPost.pet?.weight?.toString() || '',
        petSize: initialPost.pet?.size || '',
        petPersonality: initialPost.pet?.personality?.join(', ') || '',
        petSpecialNeeds: initialPost.pet?.specialNeeds || '',
        petBio: initialPost.pet?.bio || '',
        isNeutered: initialPost.pet?.isNeutered || false,
        isVaccinated: initialPost.pet?.isVaccinated || false,
      }));

      if (initialPost.tags && Array.isArray(initialPost.tags)) {
        setTags(initialPost.tags);
      }

      if (initialPost.meta) {
        setStructuredMeta(prev => ({ ...prev, ...initialPost.meta }));
      }

      if (initialPost.media && Array.isArray(initialPost.media)) {
        const urls = initialPost.media.map((m: any) => m.imageUrl || m);
        setImagePreviews(urls);

      } else if (initialPost.images && Array.isArray(initialPost.images)) {
        setImagePreviews(initialPost.images);
      } else if (initialPost.image) {
        setImagePreviews([initialPost.image]);
      }
      

      if (initialPost.city || initialPost.district || initialPost.location) {
        setEnableLocation(true);
      }
    }
  }, [isEditing, initialPost]);

  const validateStep = (): boolean => {
    const step = steps[currentStep];
    if (step === 'type' && !formData.postType) {
      toast({ title: 'Lỗi', description: 'Chọn loại bài đăng', variant: 'destructive' });
      return false;
    }
    if (step === 'details') {
      if (!formData.title.trim()) {
        toast({ title: 'Lỗi', description: 'Nhập tiêu đề', variant: 'destructive' });
        return false;
      }
      if (formData.description.trim().length < 20) {
        toast({ title: 'Lỗi', description: 'Mô tả tối thiểu 20 ký tự', variant: 'destructive' });
        return false;
      }
    }
    if (step === 'images' && imageFiles.length === 0) {
      toast({ title: 'Lỗi', description: 'Thêm ít nhất 1 ảnh', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (imageFiles.length >= 5) {
      toast({ title: 'Giới hạn ảnh', description: 'Tối đa 5 ảnh', variant: 'destructive' });
      return;
    }
    const file = files[0];
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast({ title: 'Lỗi', description: 'File phải là ảnh < 5MB', variant: 'destructive' });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setImageFiles(prev => [...prev, file]);
    setImagePreviews(prev => [...prev, previewUrl]);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const cleanMeta = (meta: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.entries(meta).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const buildMeta = () => {
    switch (formData.postType) {
      case 'LOST_FOUND':
        return cleanMeta({
          lastSeenLocation: structuredMeta.lastSeenLocation,
          reward: structuredMeta.reward,
          distinguishingMarks: structuredMeta.distinguishingMarks,
          contact: structuredMeta.lostFoundContact,
        });
      case 'ADOPTION':
        return cleanMeta({
          adoptionRequirements: structuredMeta.adoptionRequirements,
          vaccinationStatus: structuredMeta.vaccinationStatus,
          contact: structuredMeta.adoptionContact,
        });
      case 'REVIEW':
        return cleanMeta({
          placeName: structuredMeta.placeName,
          serviceType: structuredMeta.serviceType,
          rating: structuredMeta.rating ? parseFloat(structuredMeta.rating) : null,
          priceRange: structuredMeta.priceRange,
          address: structuredMeta.address,
          pros: structuredMeta.pros,
          cons: structuredMeta.cons,
        });
      case 'QNA':
        return {
          questionTopic: 'general',
          difficulty: 'easy',
        };
      case 'TIP':
        return cleanMeta({
          topic: structuredMeta.tipTopic,
          context: structuredMeta.tipContext,
        });
      case 'BREEDING':
        return cleanMeta({
          requirements: structuredMeta.breedingRequirements,
          contact: structuredMeta.breedingContact,
        });
      case 'MARKETPLACE':
        return cleanMeta({
          itemName: structuredMeta.marketplaceItemName,
          condition: structuredMeta.marketplaceCondition,
          price: structuredMeta.marketplacePrice,
          pickupMethod: structuredMeta.marketplacePickup,
          contact: structuredMeta.marketplaceContact,
        });
      default:
        return {};
    }
  };

  const buildPetData = () => {
    const pet: Record<string, any> = {};
    if (formData.petName) pet.name = formData.petName;
    if (formData.petBreed) pet.breed = formData.petBreed;
    if (formData.petAge) pet.age = parseInt(formData.petAge);
    if (formData.petGender) pet.gender = formData.petGender;
    if (formData.petColor) pet.color = formData.petColor;
    if (formData.petWeight) pet.weight = parseFloat(formData.petWeight);
    if (formData.petSize) pet.size = formData.petSize;
    if (formData.petSpecialNeeds) pet.specialNeeds = formData.petSpecialNeeds;
    if (formData.petBio) pet.bio = formData.petBio;
    if (formData.petPersonality) {
      const traits = formData.petPersonality.split(',').map(t => t.trim()).filter(Boolean);
      if (traits.length > 0) pet.personality = traits;
    }
    if (formData.isNeutered) pet.isNeutered = true;
    if (formData.isVaccinated) pet.isVaccinated = true;
    return Object.keys(pet).length > 0 ? pet : null;
  };

  const buildHealthRecord = () => {
    const health: Record<string, any> = {};
    if (formData.healthWeight) health.weight = parseFloat(formData.healthWeight);
    if (allergies.length > 0) health.allergies = allergies;
    if (formData.healthNotes) health.notes = formData.healthNotes;
    if (vaccinations.length > 0) {
      health.vaccinations = vaccinations.map(v => ({
        name: v.name,
        date: v.date,
      }));
    }
    if (medicalHistory.length > 0) {
      health.medicalHistory = medicalHistory.map(m => ({
        condition: m.condition,
        treatment: m.treatment,
        date: m.date,
        notes: m.notes || undefined,
      }));
    }
    return Object.keys(health).length > 0 ? health : null;
  };

  const handleSubmit = async () => {

    if (!isEditing && !validateStep()) return;
    if (isEditing && steps[currentStep] === 'images' && imagePreviews.length === 0 && imageFiles.length === 0) {
      toast({ title: 'Lỗi', description: 'Thêm ít nhất 1 ảnh', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const meta = buildMeta();
      const pet = buildPetData();
      const healthRecord = buildHealthRecord();

      const resolveStatus = () => {
        if (formData.status) return formData.status;
        return 'GENERAL';
      };

      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        petType: formData.petType,
        status: resolveStatus(),
        postType: formData.postType,
        city: formData.city || 'Online',
      };

      if (formData.district) payload.district = formData.district;
      if (formData.location) payload.location = formData.location;
      if (tags.length > 0) payload.tags = tags;
      if (Object.keys(meta).length > 0) payload.meta = meta;
      if (pet) payload.pet = pet;
      if (healthRecord) payload.healthRecord = healthRecord;

      let response;
      if (isEditing && initialPost?.id) {

        response = await petPostService.updatePost(Number(initialPost.id), payload);

        if (imageFiles.length > 0) {
          await petPostService.uploadImages(Number(initialPost.id), imageFiles);
        }
        toast({ title: 'Thành công!', description: 'Bài đăng đã được cập nhật.' });
      } else {

        response = await petPostService.createPost(payload, imageFiles);
        toast({ title: 'Thành công!', description: 'Bài đăng đã được tạo.' });
      }
      
      if (onPostCreated) onPostCreated(response.data);
    } catch (error) {
      toast({ title: 'Lỗi', description: isEditing ? 'Không cập nhật được bài đăng.' : 'Không tạo được bài đăng.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepKey = steps[currentStep];

  return (
    <div className="relative p-2">
      
      {currentStep > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-300"
              style={{ width: `${progressAfterTypeSelection}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Bước {currentStep} / {steps.length - 1}
          </p>
        </div>
      )}

      
      {currentStepKey === 'type' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center">Chọn loại bài đăng 🤔</h3>
          <div className="grid grid-cols-2 gap-3">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, postType: type.value }))}
                className={cn(
                  'p-4 rounded-xl text-left transition-all border',
                  formData.postType === type.value ? 'ring-2 ring-orange-400 bg-orange-50' : 'bg-white hover:shadow-md'
                )}
              >
                <div className="text-3xl mb-2">{type.emoji}</div>
                <p className="font-semibold text-sm mb-1">{type.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      
      {currentStepKey === 'details' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="text-lg font-bold text-center mb-4">Nội dung bài đăng ✍️</h3>
          
          
          {(['LOST_FOUND', 'ADOPTION'].includes(formData.postType)) && (
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <div className="flex gap-2">
                {formData.postType === 'LOST_FOUND' && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.status === 'LOST' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'LOST' }))}
                      className="flex-1"
                    >
                      Thất lạc
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.status === 'FOUND' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'FOUND' }))}
                      className="flex-1"
                    >
                      Tìm thấy
                    </Button>
                  </>
                )}
                {formData.postType === 'ADOPTION' && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.status === 'FOR_ADOPTION' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'FOR_ADOPTION' }))}
                      className="flex-1"
                    >
                      Cần nhà
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.status === 'RESCUE' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, status: 'RESCUE' }))}
                      className="flex-1"
                    >
                      Cứu hộ
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {formData.postType !== 'REVIEW' && (
            <div className="space-y-2">
              <Label>Loại thú cưng</Label>
              <Select value={formData.petType} onValueChange={(value) => setFormData(prev => ({ ...prev, petType: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PET_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tiêu đề *</Label>
            <Input
              placeholder="Ví dụ: Chó Husky mất tích..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          
          <div className="space-y-2">
            <Label>Hashtag/Tag</Label>
            <Input
              placeholder="lost, husky, urgent (cách nhau bởi dấu phẩy)"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                setTags(newTags);
              }}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">#{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mô tả * (tối thiểu 20 ký tự)</Label>
            <Textarea
              placeholder="Mô tả chi tiết..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">{formData.description.trim().length}/2000</div>
          </div>

          

          
          {formData.postType === 'LOST_FOUND' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin thất lạc</h4>
              <div className="space-y-2">
                <Label>Vị trí thấy lần cuối</Label>
                <Input value={structuredMeta.lastSeenLocation} onChange={(e) => setStructuredMeta(prev => ({ ...prev, lastSeenLocation: e.target.value }))} placeholder="Quận 1, TP.HCM" />
              </div>
              <div className="space-y-2">
                <Label>Phần thưởng (nếu có)</Label>
                <Input value={structuredMeta.reward} onChange={(e) => setStructuredMeta(prev => ({ ...prev, reward: e.target.value }))} placeholder="500,000 VND" />
              </div>
              <div className="space-y-2">
                <Label>Dấu hiệu nhận dạng</Label>
                <Textarea value={structuredMeta.distinguishingMarks} onChange={(e) => setStructuredMeta(prev => ({ ...prev, distinguishingMarks: e.target.value }))} placeholder="Vết sẹo ở chân trái..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Liên hệ</Label>
                <Input value={structuredMeta.lostFoundContact} onChange={(e) => setStructuredMeta(prev => ({ ...prev, lostFoundContact: e.target.value }))} placeholder="SĐT / Zalo" />
              </div>
            </div>
          )}

          {formData.postType === 'ADOPTION' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin nhận nuôi</h4>
              <div className="space-y-2">
                <Label>Yêu cầu nhận nuôi</Label>
                <Textarea value={structuredMeta.adoptionRequirements} onChange={(e) => setStructuredMeta(prev => ({ ...prev, adoptionRequirements: e.target.value }))} placeholder="Có kinh nghiệm nuôi chó..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Tình trạng tiêm phòng</Label>
                <Input value={structuredMeta.vaccinationStatus} onChange={(e) => setStructuredMeta(prev => ({ ...prev, vaccinationStatus: e.target.value }))} placeholder="Đã tiêm đủ vaccine" />
              </div>
              <div className="space-y-2">
                <Label>Liên hệ</Label>
                <Input value={structuredMeta.adoptionContact} onChange={(e) => setStructuredMeta(prev => ({ ...prev, adoptionContact: e.target.value }))} placeholder="SĐT / Zalo" />
              </div>
            </div>
          )}

          {formData.postType === 'BREEDING' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin phối giống</h4>
              <div className="space-y-2">
                <Label>Yêu cầu phối giống</Label>
                <Textarea value={structuredMeta.breedingRequirements} onChange={(e) => setStructuredMeta(prev => ({ ...prev, breedingRequirements: e.target.value }))} placeholder="Cần tìm partner giống corgi, tiêm đủ vaccine..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Liên hệ</Label>
                <Input value={structuredMeta.breedingContact} onChange={(e) => setStructuredMeta(prev => ({ ...prev, breedingContact: e.target.value }))} placeholder="SĐT / Zalo / FB" />
              </div>
            </div>
          )}

          {formData.postType === 'REVIEW' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin đánh giá</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label>Tên địa điểm</Label>
                  <Input value={structuredMeta.placeName} onChange={(e) => setStructuredMeta(prev => ({ ...prev, placeName: e.target.value }))} placeholder="Phòng khám thú y ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Loại dịch vụ</Label>
                  <Input value={structuredMeta.serviceType} onChange={(e) => setStructuredMeta(prev => ({ ...prev, serviceType: e.target.value }))} placeholder="Khám bệnh" />
                </div>
                <div className="space-y-2">
                  <Label>Đánh giá (1-5 sao)</Label>
                  <Input type="number" min="1" max="5" step="0.5" value={structuredMeta.rating} onChange={(e) => setStructuredMeta(prev => ({ ...prev, rating: e.target.value }))} placeholder="4.5" />
                </div>
                <div className="space-y-2">
                  <Label>Khoảng giá</Label>
                  <Input value={structuredMeta.priceRange} onChange={(e) => setStructuredMeta(prev => ({ ...prev, priceRange: e.target.value }))} placeholder="100k-500k" />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input value={structuredMeta.address} onChange={(e) => setStructuredMeta(prev => ({ ...prev, address: e.target.value }))} placeholder="123 Nguyễn Huệ" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Ưu điểm</Label>
                  <Textarea value={structuredMeta.pros} onChange={(e) => setStructuredMeta(prev => ({ ...prev, pros: e.target.value }))} placeholder="Chuyên nghiệp, tận tâm..." rows={2} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Nhược điểm</Label>
                  <Textarea value={structuredMeta.cons} onChange={(e) => setStructuredMeta(prev => ({ ...prev, cons: e.target.value }))} placeholder="Hơi đắt, đông khách..." rows={2} />
                </div>
              </div>
            </div>
          )}

          {formData.postType === 'QNA' && (

             <></>
          )}

          {formData.postType === 'TIP' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin mẹo hay</h4>
              <div className="space-y-2">
                <Label>Chủ đề</Label>
                <Input value={structuredMeta.tipTopic} onChange={(e) => setStructuredMeta(prev => ({ ...prev, tipTopic: e.target.value }))} placeholder="Huấn luyện chó con" />
              </div>
              <div className="space-y-2">
                <Label>Ngữ cảnh phù hợp</Label>
                <Textarea value={structuredMeta.tipContext} onChange={(e) => setStructuredMeta(prev => ({ ...prev, tipContext: e.target.value }))} placeholder="Áp dụng cho chó 2-6 tháng tuổi..." rows={3} />
              </div>
            </div>
          )}

          {formData.postType === 'MARKETPLACE' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-semibold text-sm">Thông tin sản phẩm</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label>Tên sản phẩm</Label>
                  <Input value={structuredMeta.marketplaceItemName} onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplaceItemName: e.target.value }))} placeholder="Cây trèo mèo cũ" />
                </div>
                <div className="space-y-2">
                  <Label>Tình trạng</Label>
                  <Input value={structuredMeta.marketplaceCondition} onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplaceCondition: e.target.value }))} placeholder="95% mới" />
                </div>
                <div className="space-y-2">
                  <Label>Giá</Label>
                  <Input value={structuredMeta.marketplacePrice} onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplacePrice: e.target.value }))} placeholder="500,000 VND" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Cách nhận hàng</Label>
                  <Input value={structuredMeta.marketplacePickup} onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplacePickup: e.target.value }))} placeholder="Ship / gặp trực tiếp" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Liên hệ</Label>
                  <Input value={structuredMeta.marketplaceContact} onChange={(e) => setStructuredMeta(prev => ({ ...prev, marketplaceContact: e.target.value }))} placeholder="SĐT / Zalo / FB" />
                </div>
              </div>
            </div>
          )}

          
          {!requiresPetInfo && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Thêm địa điểm</p>
                <p className="text-xs text-muted-foreground">Bài chia sẻ có thể thêm địa điểm tuỳ chọn</p>
              </div>
              <Switch checked={enableLocation} onCheckedChange={setEnableLocation} />
            </div>
          )}

          
          {(requiresPetInfo || enableLocation) && (
            <>
              <div className="space-y-2">
                <Label>Thành phố *</Label>
                <Input
                  placeholder="TP.HCM"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Quận/Huyện</Label>
                <Input
                  placeholder="Quận 1"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input
                  placeholder="123 Nguyễn Huệ"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>
      )}

      
      {currentStepKey === 'pet' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="text-lg font-bold text-center">Thông tin thú cưng 🐾</h3>
          <p className="text-sm text-center text-muted-foreground">Có thể bỏ qua bước này</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input value={formData.petName} onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))} placeholder="Max" />
            </div>
            <div className="space-y-2">
              <Label>Giống</Label>
              <Input value={formData.petBreed} onChange={(e) => setFormData(prev => ({ ...prev, petBreed: e.target.value }))} placeholder="Husky" />
            </div>
            <div className="space-y-2">
              <Label>Tuổi (tháng)</Label>
              <Input type="number" value={formData.petAge} onChange={(e) => setFormData(prev => ({ ...prev, petAge: e.target.value }))} placeholder="24" />
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select value={formData.petGender} onValueChange={(value) => setFormData(prev => ({ ...prev, petGender: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {PET_GENDERS.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Màu lông</Label>
              <Input value={formData.petColor} onChange={(e) => setFormData(prev => ({ ...prev, petColor: e.target.value }))} placeholder="Trắng xám" />
            </div>
            <div className="space-y-2">
              <Label>Cân nặng (kg)</Label>
              <Input type="number" step="0.1" value={formData.petWeight} onChange={(e) => setFormData(prev => ({ ...prev, petWeight: e.target.value }))} placeholder="15.5" />
            </div>
            <div className="space-y-2">
              <Label>Kích thước</Label>
              <Select value={formData.petSize} onValueChange={(value) => setFormData(prev => ({ ...prev, petSize: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {PET_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tính cách</Label>
              <Input 
                value={formData.petPersonality} 
                onChange={(e) => setFormData(prev => ({ ...prev, petPersonality: e.target.value }))} 
                placeholder="Hiền lành, năng động (cách nhau dấu phẩy)" 
              />
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <Label>Nhu cầu đặc biệt</Label>
            <Input 
              value={formData.petSpecialNeeds} 
              onChange={(e) => setFormData(prev => ({ ...prev, petSpecialNeeds: e.target.value }))} 
              placeholder="Cần uống thuốc mỗi ngày..." 
            />
          </div>
          
          <div className="space-y-2 mt-3">
            <Label>Mô tả thêm</Label>
            <Textarea 
              value={formData.petBio} 
              onChange={(e) => setFormData(prev => ({ ...prev, petBio: e.target.value }))} 
              placeholder="Thích chơi bóng, sợ sấm sét..." 
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">Đã triệt sản</span>
            <Switch checked={formData.isNeutered} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNeutered: checked }))} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">Đã tiêm vaccine</span>
            <Switch checked={formData.isVaccinated} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVaccinated: checked }))} />
          </div>
        </div>
      )}

      
      {currentStepKey === 'health' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="text-lg font-bold text-center">Hồ sơ y tế 🩺</h3>
          <p className="text-sm text-center text-muted-foreground mb-4">Không bắt buộc</p>
          
          
          <div className="space-y-2">
            <Label>Cân nặng (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="15.5"
              value={formData.healthWeight}
              onChange={(e) => setFormData(prev => ({ ...prev, healthWeight: e.target.value }))}
            />
          </div>

          
          <div className="space-y-2">
            <Label>Dị ứng</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Thêm dị ứng..."
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allergyInput.trim()) {
                    e.preventDefault();
                    setAllergies(prev => [...prev, allergyInput.trim()]);
                    setAllergyInput('');
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (allergyInput.trim()) {
                    setAllergies(prev => [...prev, allergyInput.trim()]);
                    setAllergyInput('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => setAllergies(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          
          <div className="space-y-2 pt-3 border-t">
            <Label className="font-semibold">Tiêm phòng</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Tên vaccine"
                value={vaccineInput.name}
                onChange={(e) => setVaccineInput(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="Ngày tiêm"
                value={vaccineInput.date}
                onChange={(e) => setVaccineInput(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                if (vaccineInput.name.trim() && vaccineInput.date) {
                  setVaccinations(prev => [...prev, { name: vaccineInput.name.trim(), date: vaccineInput.date }]);
                  setVaccineInput({name: '', date: ''});
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm vaccine
            </Button>
            {vaccinations.length > 0 && (
              <div className="space-y-2 mt-2">
                {vaccinations.map((vaccine, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      <p className="font-medium">{vaccine.name}</p>
                      <p className="text-xs text-muted-foreground">{vaccine.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVaccinations(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="space-y-2 pt-3 border-t">
            <Label className="font-semibold">Lịch sử khám bệnh</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Tình trạng"
                value={medicalInput.condition}
                onChange={(e) => setMedicalInput(prev => ({ ...prev, condition: e.target.value }))}
              />
              <Input
                placeholder="Điều trị"
                value={medicalInput.treatment}
                onChange={(e) => setMedicalInput(prev => ({ ...prev, treatment: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="Ngày khám"
                value={medicalInput.date}
                onChange={(e) => setMedicalInput(prev => ({ ...prev, date: e.target.value }))}
              />
              <Input
                placeholder="Ghi chú"
                value={medicalInput.notes}
                onChange={(e) => setMedicalInput(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                if (medicalInput.condition.trim() && medicalInput.treatment.trim() && medicalInput.date) {
                  setMedicalHistory(prev => [...prev, {
                    condition: medicalInput.condition.trim(),
                    treatment: medicalInput.treatment.trim(),
                    date: medicalInput.date,
                    notes: medicalInput.notes.trim() || undefined,
                  }]);
                  setMedicalInput({condition: '', treatment: '', date: '', notes: ''});
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm lịch sử
            </Button>
            {medicalHistory.length > 0 && (
              <div className="space-y-2 mt-2">
                {medicalHistory.map((record, idx) => (
                  <div key={idx} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                    <div className="text-sm flex-1">
                      <p className="font-medium">{record.condition} → {record.treatment}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                      {record.notes && <p className="text-xs text-muted-foreground italic">{record.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMedicalHistory(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="space-y-2 pt-3 border-t">
            <Label>Ghi chú y tế khác</Label>
            <Textarea
              placeholder="Thông tin sức khỏe khác, thuốc đang dùng..."
              value={formData.healthNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, healthNotes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      )}

      
      {currentStepKey === 'images' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center">Thêm hình ảnh 📷</h3>
          <div className="grid grid-cols-3 gap-3">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                <Image src={preview} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {imageFiles.length < 5 && (
              <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Thêm ảnh</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-center text-muted-foreground">Tối đa 5 ảnh, mỗi ảnh &lt; 5MB</p>
        </div>
      )}

      
      <div className="flex justify-between items-center mt-8 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={currentStep === 0 ? onCancel : goPrev} disabled={isSubmitting}>
          {currentStep === 0 ? 'Hủy' : <><ChevronLeft className="h-4 w-4 mr-1" /> Quay lại</>}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>Tiếp theo <ChevronRight className="h-4 w-4 ml-1" /></Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang tạo...</> : 'Đăng bài'}
          </Button>
        )}
      </div>
    </div>
  );
}
