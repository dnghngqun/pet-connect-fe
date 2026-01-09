'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, PawPrint, Heart, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import petPostService, { PostDetail } from '@/services/petPostService';
import locationService from '@/services/locationService';
import authService from '@/services/authService';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

const POST_STATUS = [
  { value: 'LOST', label: 'Thất lạc' },
  { value: 'FOUND', label: 'Tìm thấy' },
  { value: 'FOR_ADOPTION', label: 'Cần tìm nhà mới' },
  { value: 'RESCUE', label: 'Cần cứu hộ' },
];

const PET_GENDERS = [
  { value: 'MALE', label: 'Đực' },
  { value: 'FEMALE', label: 'Cái' },
];

const PET_SIZES = [
  { value: 'SMALL', label: 'Nhỏ (< 5kg)' },
  { value: 'MEDIUM', label: 'Vừa (5-15kg)' },
  { value: 'LARGE', label: 'Lớn (> 15kg)' },
];

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<'post' | 'pet' | 'health'>('post');
  

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    city: '',
    district: '',
    location: '',
    tags: [] as string[],
  });
  

  const [petData, setPetData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: '',
    color: '',
    size: '',
    weight: '',
    isNeutered: false,
    isVaccinated: false,
    personality: [] as string[],
    specialNeeds: '',
    bio: '',
  });
  

  const [healthData, setHealthData] = useState({
    allergies: [] as string[],
    weight: '',
    notes: '',
    vaccinations: [] as { id?: number; name: string; date: string; nextDueDate?: string }[],
    medicalHistory: [] as { id?: number; condition: string; treatment: string; date: string; notes?: string; weight?: string }[],
  });
  

  const [deletedVaccinations, setDeletedVaccinations] = useState<number[]>([]);
  const [deletedMedicalHistory, setDeletedMedicalHistory] = useState<number[]>([]);
  

  const [newAllergy, setNewAllergy] = useState('');
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '', nextDueDate: '' });
  const [newMedical, setNewMedical] = useState({ condition: '', treatment: '', date: '', notes: '', weight: '' });
  
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  
  useEffect(() => {
    loadPost();
    loadCities();
  }, [resolvedParams.id]);
  
  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await petPostService.getPostBySlug(resolvedParams.id);
      const data = response.data;
      
      if (data) {
        setPostDetail(data);
        

        const currentUser = authService.getCurrentUser();
        const ownerMatch = currentUser && String(currentUser.id) === String(data.postedBy?.id);
        setIsOwner(!!ownerMatch);
        
        if (!ownerMatch) {
          toast({
            title: 'Không có quyền',
            description: 'Bạn không có quyền chỉnh sửa bài đăng này',
            variant: 'destructive',
          });
          router.push('/shop');
          return;
        }
        

        setFormData({
          title: data.title || '',
          description: data.description || '',
          status: data.status || '',
          city: data.city || '',
          district: data.district || '',
          location: data.location || '',
          tags: data.tags || [],
        });
        

        if (data.pet) {
          setPetData({
            name: data.pet.name || '',
            breed: data.pet.breed || '',
            age: data.pet.age?.toString() || '',
            gender: data.pet.gender?.toUpperCase() || '',
            color: data.pet.color || '',
            size: data.pet.size?.toUpperCase() || '',
            weight: data.pet.weight?.toString() || '',
            isNeutered: data.pet.isNeutered || false,

            isVaccinated: (data.pet as any).isVaccinated || false, 
            personality: data.pet.personality || [],
            specialNeeds: data.pet.specialNeeds || '',
            bio: data.pet.bio || '',
          });
          

          if (data.pet.healthRecord) {
            const hr = data.pet.healthRecord;
            

            const mappedVaccinations = hr.vaccinations?.map(v => ({
               id: v.id,
               name: v.name,
               date: v.vaccinationDate ? v.vaccinationDate.split('T')[0] : '',
               nextDueDate: v.nextDueDate ? v.nextDueDate.split('T')[0] : ''
            })) || [];

            const mappedMedicalHistory = hr.medicalHistory?.map(m => ({
               id: m.id,
               condition: m.condition,
               treatment: m.treatment,
               date: m.visitDate ? m.visitDate.split('T')[0] : '',
               notes: m.notes,
               weight: m.weight?.toString() || ''
            })) || [];

            setHealthData({
              allergies: hr.allergies || [],
              weight: hr.weight?.toString() || '',
              notes: hr.notes || '',
              vaccinations: mappedVaccinations,
              medicalHistory: mappedMedicalHistory,
            });
          }
        }
        

        if (data.city) {
          const districtRes = await locationService.getDistricts(data.city);
          setDistricts(districtRes.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải bài đăng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadCities = async () => {
    try {
      const res = await locationService.getCities();
      setCities(res.data || []);
    } catch {
      setCities(['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']);
    }
  };
  
  const handleCityChange = async (city: string) => {
    setFormData(prev => ({ ...prev, city, district: '' }));
    try {
      const res = await locationService.getDistricts(city);
      setDistricts(res.data || []);
    } catch {
      setDistricts([]);
    }
  };
  

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setHealthData(prev => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim()] }));
      setNewAllergy('');
    }
  };
  
  const removeAllergy = (index: number) => {
    setHealthData(prev => ({ ...prev, allergies: prev.allergies.filter((_, i) => i !== index) }));
  };
  

  const addVaccination = () => {
    if (newVaccine.name.trim() && newVaccine.date) {
      setHealthData(prev => ({ ...prev, vaccinations: [...prev.vaccinations, { ...newVaccine }] }));
      setNewVaccine({ name: '', date: '', nextDueDate: '' });
    }
  };
  
  const removeVaccination = (index: number) => {
    const vac = healthData.vaccinations[index];
    if (vac.id) {
        setDeletedVaccinations(prev => [...prev, vac.id!]);
    }
    setHealthData(prev => ({ ...prev, vaccinations: prev.vaccinations.filter((_, i) => i !== index) }));
  };
  

  const addMedicalHistory = () => {
    if (newMedical.condition.trim() && newMedical.treatment.trim()) {
      setHealthData(prev => ({ ...prev, medicalHistory: [...prev.medicalHistory, { ...newMedical }] }));
      setNewMedical({ condition: '', treatment: '', date: '', notes: '', weight: '' });
    }
  };
  
  const removeMedicalHistory = (index: number) => {
    const med = healthData.medicalHistory[index];
    if (med.id) {
        setDeletedMedicalHistory(prev => [...prev, med.id!]);
    }
    setHealthData(prev => ({ ...prev, medicalHistory: prev.medicalHistory.filter((_, i) => i !== index) }));
  };
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tiêu đề bài đăng',
        variant: 'destructive',
      });
      return;
    }
    
    
    try {
      setSaving(true);
      

      const hasHealthData = 
        healthData.allergies.length > 0 ||
        healthData.notes || 
        healthData.weight;
      
      const healthRecordPayload = hasHealthData ? {
          allergies: healthData.allergies.length > 0 ? healthData.allergies : undefined,
          notes: healthData.notes || undefined,
          weight: healthData.weight ? parseFloat(healthData.weight) : undefined,
      } : undefined;
      await petPostService.updatePost(Number(resolvedParams.id), {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        city: formData.city,
        district: formData.district,
        location: formData.location,
        tags: formData.tags,
        pet: {
          name: petData.name || undefined,
          breed: petData.breed || undefined,
          age: petData.age ? parseInt(petData.age) : undefined,
          gender: petData.gender || undefined,
          color: petData.color || undefined,
          size: petData.size || undefined,
          weight: petData.weight ? parseFloat(petData.weight) : undefined,
          personality: petData.personality.length > 0 ? petData.personality : undefined,
          specialNeeds: petData.specialNeeds || undefined,
          bio: petData.bio || undefined,
          isVaccinated: petData.isVaccinated,
          isNeutered: petData.isNeutered,
        },
        healthRecord: healthRecordPayload
      });
      

      if (postDetail?.pet?.id) {
        const petId = postDetail.pet.id;
        for (const vac of healthData.vaccinations) {
            if (!vac.id) {
                await petPostService.addVaccination(petId, { 
                    name: vac.name, 
                    date: vac.date,
                    nextDueDate: vac.nextDueDate || undefined
                });
            }
        }

        for (const vacId of deletedVaccinations) {
            await petPostService.deleteVaccination(petId, vacId);
        }
        for (const med of healthData.medicalHistory) {
            if (!med.id) {
                await petPostService.addMedicalHistory(petId, { 
                    condition: med.condition, 
                    treatment: med.treatment, 
                    date: med.date,
                    notes: med.notes,
                    weight: med.weight ? parseFloat(med.weight) : undefined
                });
            }
        }

        for (const medId of deletedMedicalHistory) {
             await petPostService.deleteMedicalHistory(petId, medId);
        }
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật bài đăng và thông tin thú cưng',
      });
      

      router.refresh();
      router.push(`/pet/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to update:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isOwner) {
    return null;
  }
  
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pet/${resolvedParams.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài đăng</h1>
          <p className="text-muted-foreground">Cập nhật thông tin bài đăng, thú cưng và hồ sơ y tế</p>
        </div>
      </div>
      
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'post' ? 'default' : 'outline'}
          onClick={() => setActiveTab('post')}
          className="flex-1"
        >
          📋 Bài đăng
        </Button>
        <Button
          variant={activeTab === 'pet' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pet')}
          className="flex-1"
        >
          <PawPrint className="h-4 w-4 mr-2" />
          Thú cưng
        </Button>
        <Button
          variant={activeTab === 'health' ? 'default' : 'outline'}
          onClick={() => setActiveTab('health')}
          className="flex-1"
        >
          <Heart className="h-4 w-4 mr-2" />
          Hồ sơ y tế
        </Button>
      </div>
      
      
      {activeTab === 'post' && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài đăng</CardTitle>
            <CardDescription>
              Chỉnh sửa tiêu đề, mô tả và vị trí của bài đăng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề bài đăng"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {POST_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về bài đăng..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thành phố</Label>
                <Select value={formData.city} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Quận/Huyện</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Địa chỉ chi tiết</Label>
              <Input
                id="location"
                placeholder="Nhập địa chỉ cụ thể"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      
      {activeTab === 'pet' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Thông tin thú cưng
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin chi tiết về thú cưng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên</Label>
                <Input
                  placeholder="Tên thú cưng"
                  value={petData.name}
                  onChange={(e) => setPetData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Giống</Label>
                <Input
                  placeholder="Giống thú cưng"
                  value={petData.breed}
                  onChange={(e) => setPetData(prev => ({ ...prev, breed: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tuổi (tháng)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={petData.age}
                  onChange={(e) => setPetData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select
                  value={petData.gender}
                  onValueChange={(value) => setPetData(prev => ({ ...prev, gender: value }))}
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
                  value={petData.size}
                  onValueChange={(value) => setPetData(prev => ({ ...prev, size: value }))}
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
                <Label>Màu lông</Label>
                <Input
                  placeholder="Vàng, trắng..."
                  value={petData.color}
                  onChange={(e) => setPetData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cân nặng (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={petData.weight}
                  onChange={(e) => setPetData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nhu cầu đặc biệt</Label>
              <Textarea
                placeholder="Mô tả nhu cầu đặc biệt nếu có..."
                value={petData.specialNeeds}
                onChange={(e) => setPetData(prev => ({ ...prev, specialNeeds: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Giới thiệu</Label>
              <Textarea
                placeholder="Mô tả về tính cách, thói quen..."
                value={petData.bio}
                onChange={(e) => setPetData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      
      {activeTab === 'health' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Hồ sơ y tế
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin sức khỏe của thú cưng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label>Dị ứng</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm dị ứng..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <Button type="button" size="icon" onClick={addAllergy}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {healthData.allergies.map((allergy, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {allergy}
                    <button onClick={() => removeAllergy(i)} className="hover:bg-red-200 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            
            <div className="space-y-2">
              <Label>Tiêm phòng</Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Tên vaccine</Label>
                  <Input
                    placeholder="Tên vaccine"
                    value={newVaccine.name}
                    onChange={(e) => setNewVaccine(prev => ({ ...prev, name: e.target.value }))}
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
                <Button type="button" size="icon" onClick={addVaccination}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {healthData.vaccinations.map((vac, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="font-medium">{vac.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">Ngày tiêm: {vac.date}</span>
                      {vac.nextDueDate && (
                        <span className="text-sm text-muted-foreground ml-2">| Lần tới: {vac.nextDueDate}</span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeVaccination(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            
            <div className="space-y-2">
              <Label>Lịch sử khám bệnh</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Tình trạng"
                  value={newMedical.condition}
                  onChange={(e) => setNewMedical(prev => ({ ...prev, condition: e.target.value }))}
                />
                <Input
                  placeholder="Điều trị"
                  value={newMedical.treatment}
                  onChange={(e) => setNewMedical(prev => ({ ...prev, treatment: e.target.value }))}
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
                    placeholder="Ghi chú..."
                    value={newMedical.notes}
                    onChange={(e) => setNewMedical(prev => ({ ...prev, notes: e.target.value }))}
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
                <Button type="button" size="icon" className="self-end" onClick={addMedicalHistory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {healthData.medicalHistory.map((med, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium">{med.condition}</span>
                        {med.date && <span className="text-sm text-muted-foreground ml-2">({med.date})</span>}
                        {med.weight && <span className="text-sm text-green-600 ml-2">• {med.weight} kg</span>}
                        <p className="text-sm mt-1">Điều trị: {med.treatment}</p>
                        {med.notes && <p className="text-sm text-muted-foreground">Ghi chú: {med.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMedicalHistory(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            
            <div className="space-y-2">
              <Label>Ghi chú y tế</Label>
              <Textarea
                placeholder="Ghi chú thêm về sức khỏe..."
                value={healthData.notes}
                onChange={(e) => setHealthData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          asChild
        >
          <Link href={`/pet/${resolvedParams.id}`}>
            Hủy
          </Link>
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
