'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Heart,
  Syringe,
  Stethoscope,
  Scale,
  QrCode,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  PawPrint,
  ClipboardList,
  TrendingUp,
  Bell,
  Download,
} from 'lucide-react';
import petHealthService, {
  PetHealthProfile,
  Vaccination,
  MedicalHistory,
  WeightTracking,
  VaccinationReminder,
  AddVaccinationRequest,
  AddMedicalHistoryRequest,
  AddWeightTrackingRequest,
} from '@/services/petHealthService';
import authService from '@/services/authService';

interface PageParams {
  id: string;
}

export default function PetHealthPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const petId = parseInt(resolvedParams.id);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PetHealthProfile | null>(null);
  const [reminders, setReminders] = useState<VaccinationReminder[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false);
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vaccinationForm, setVaccinationForm] = useState<AddVaccinationRequest>({
    name: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [medicalForm, setMedicalForm] = useState<AddMedicalHistoryRequest>({
    date: new Date().toISOString().split('T')[0],
    condition: '',
    treatment: '',
  });
  const [weightForm, setWeightForm] = useState<AddWeightTrackingRequest>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(!!user);

    if (!user) {
      router.push('/sign-in');
      return;
    }

    loadHealthProfile();
    loadReminders();
  }, [petId]);

  const loadHealthProfile = async () => {
    try {
      setIsLoading(true);
      const response = await petHealthService.getHealthProfile(petId);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải hồ sơ sức khỏe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const response = await petHealthService.getUpcomingVaccinations(petId, 60);
      if (response.success) {
        setReminders(response.data);
      }
    } catch {
    }
  };

  const loadQRCode = async () => {
    try {
      const blob = await petHealthService.getPetQRCode(petId);
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
      setQrDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải mã QR',
        variant: 'destructive',
      });
    }
  };

  const handleAddVaccination = async () => {
    if (!vaccinationForm.name || !vaccinationForm.date) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await petHealthService.addVaccination(petId, vaccinationForm);
      if (response.success) {
        toast({ title: 'Thành công', description: 'Đã thêm thông tin tiêm chủng' });
        setVaccinationDialogOpen(false);
        setVaccinationForm({ name: '', date: new Date().toISOString().split('T')[0] });
        loadHealthProfile();
        loadReminders();
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm tiêm chủng', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedicalHistory = async () => {
    if (!medicalForm.condition || !medicalForm.treatment || !medicalForm.date) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await petHealthService.addMedicalHistory(petId, medicalForm);
      if (response.success) {
        toast({ title: 'Thành công', description: 'Đã thêm lịch sử y tế' });
        setMedicalDialogOpen(false);
        setMedicalForm({ date: new Date().toISOString().split('T')[0], condition: '', treatment: '' });
        loadHealthProfile();
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể thêm lịch sử y tế', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWeight = async () => {
    if (!weightForm.weight || weightForm.weight <= 0) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập cân nặng hợp lệ', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await petHealthService.addWeightTracking(petId, weightForm);
      if (response.success) {
        toast({ title: 'Thành công', description: 'Đã ghi nhận cân nặng' });
        setWeightDialogOpen(false);
        setWeightForm({ date: new Date().toISOString().split('T')[0], weight: 0 });
        loadHealthProfile();
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể ghi nhận cân nặng', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy thú cưng</h3>
            <p className="text-muted-foreground mb-4">Thú cưng này không tồn tại hoặc bạn không có quyền xem.</p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { pet, healthRecord } = profile;

  return (
    <div className="container py-8 max-w-5xl">
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Hồ sơ sức khỏe</h1>
          <p className="text-muted-foreground">Quản lý thông tin sức khỏe cho {pet.name}</p>
        </div>
        <Button variant="outline" onClick={loadQRCode}>
          <QrCode className="h-4 w-4 mr-2" />
          Mã QR
        </Button>
      </div>

      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={pet.profilePhoto || undefined} />
              <AvatarFallback>
                <PawPrint className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{pet.name}</h2>
              <p className="text-muted-foreground">{pet.type} {pet.breed && `- ${pet.breed}`}</p>
              <div className="flex gap-4 mt-2 text-sm">
                {pet.age && <span>🎂 {Math.floor(pet.age / 12)} tuổi {pet.age % 12} tháng</span>}
                {pet.gender && <span>{pet.gender === 'MALE' ? '♂️ Đực' : '♀️ Cái'}</span>}
                {healthRecord.weight && <span>⚖️ {healthRecord.weight} kg</span>}
              </div>
            </div>
            {reminders.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {reminders.length} lịch tiêm sắp tới
              </Badge>
            )}
          </div>

          
          {healthRecord.allergies && healthRecord.allergies.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Dị ứng:</span>
                {healthRecord.allergies.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      
      {reminders.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <Bell className="h-5 w-5" />
              Lịch tiêm chủng sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{reminder.vaccinationName}</span>
                  <Badge variant={reminder.daysUntilDue <= 7 ? 'destructive' : 'outline'}>
                    {reminder.daysUntilDue <= 0 ? 'Quá hạn' : `Còn ${reminder.daysUntilDue} ngày`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      
      <Tabs defaultValue="vaccinations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vaccinations" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Tiêm chủng
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Y tế
          </TabsTrigger>
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Cân nặng
          </TabsTrigger>
        </TabsList>

        
        <TabsContent value="vaccinations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch sử tiêm chủng</CardTitle>
                <CardDescription>Theo dõi các mũi tiêm của {pet.name}</CardDescription>
              </div>
              <Button onClick={() => setVaccinationDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            </CardHeader>
            <CardContent>
              {healthRecord.vaccinations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có thông tin tiêm chủng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthRecord.vaccinations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{v.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Ngày tiêm: {formatDate(v.date)}
                          {v.veterinarian && ` • BS. ${v.veterinarian}`}
                        </p>
                      </div>
                      {v.nextDue && (
                        <Badge variant="outline">
                          Tiếp theo: {formatDate(v.nextDue)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        
        <TabsContent value="medical">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch sử y tế</CardTitle>
                <CardDescription>Các lần khám và điều trị</CardDescription>
              </div>
              <Button onClick={() => setMedicalDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            </CardHeader>
            <CardContent>
              {healthRecord.medicalHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có lịch sử y tế</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthRecord.medicalHistory.map((m) => (
                    <div key={m.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{m.condition}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Điều trị: {m.treatment}
                          </p>
                          {m.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Ghi chú: {m.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">{formatDate(m.date)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        
        <TabsContent value="weight">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Theo dõi cân nặng</CardTitle>
                <CardDescription>Biểu đồ cân nặng theo thời gian</CardDescription>
              </div>
              <Button onClick={() => setWeightDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ghi nhận
              </Button>
            </CardHeader>
            <CardContent>
              {healthRecord.weightTracking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu cân nặng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthRecord.weightTracking.map((w, index) => (
                    <div key={w.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-primary">{w.weight} kg</div>
                        {index > 0 && (
                          <Badge variant={
                            w.weight > healthRecord.weightTracking[index - 1].weight
                              ? 'default'
                              : w.weight < healthRecord.weightTracking[index - 1].weight
                                ? 'destructive'
                                : 'secondary'
                          }>
                            {w.weight > healthRecord.weightTracking[index - 1].weight ? '↑' : 
                             w.weight < healthRecord.weightTracking[index - 1].weight ? '↓' : '→'}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">{formatDate(w.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      
      <Dialog open={vaccinationDialogOpen} onOpenChange={setVaccinationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thông tin tiêm chủng</DialogTitle>
            <DialogDescription>Ghi nhận mũi tiêm mới cho {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên vaccine *</Label>
              <Input
                value={vaccinationForm.name}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, name: e.target.value })}
                placeholder="VD: Rabies, Parvovirus..."
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày tiêm *</Label>
              <Input
                type="date"
                value={vaccinationForm.date}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày tiêm tiếp theo</Label>
              <Input
                type="date"
                value={vaccinationForm.nextDue || ''}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bác sĩ thú y</Label>
              <Input
                value={vaccinationForm.veterinarian || ''}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, veterinarian: e.target.value })}
                placeholder="Tên bác sĩ"
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={vaccinationForm.notes || ''}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVaccinationDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddVaccination} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={medicalDialogOpen} onOpenChange={setMedicalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm lịch sử y tế</DialogTitle>
            <DialogDescription>Ghi nhận lần khám/điều trị mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày khám *</Label>
              <Input
                type="date"
                value={medicalForm.date}
                onChange={(e) => setMedicalForm({ ...medicalForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tình trạng/Bệnh *</Label>
              <Input
                value={medicalForm.condition}
                onChange={(e) => setMedicalForm({ ...medicalForm, condition: e.target.value })}
                placeholder="VD: Viêm da, Nhiễm trùng..."
              />
            </div>
            <div className="space-y-2">
              <Label>Phương pháp điều trị *</Label>
              <Textarea
                value={medicalForm.treatment}
                onChange={(e) => setMedicalForm({ ...medicalForm, treatment: e.target.value })}
                placeholder="Mô tả cách điều trị..."
              />
            </div>
            <div className="space-y-2">
              <Label>Bác sĩ thú y</Label>
              <Input
                value={medicalForm.veterinarian || ''}
                onChange={(e) => setMedicalForm({ ...medicalForm, veterinarian: e.target.value })}
                placeholder="Tên bác sĩ"
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={medicalForm.notes || ''}
                onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicalDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddMedicalHistory} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ghi nhận cân nặng</DialogTitle>
            <DialogDescription>Cập nhật cân nặng hiện tại của {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày cân</Label>
              <Input
                type="date"
                value={weightForm.date}
                onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cân nặng (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                value={weightForm.weight || ''}
                onChange={(e) => setWeightForm({ ...weightForm, weight: parseFloat(e.target.value) })}
                placeholder="VD: 5.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={weightForm.notes || ''}
                onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWeightDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAddWeight} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mã QR của {pet.name}</DialogTitle>
            <DialogDescription>
              Quét mã này để xem hồ sơ sức khỏe công khai
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Pet QR Code" className="w-64 h-64" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>Đóng</Button>
            {qrCodeUrl && (
              <Button asChild>
                <a href={qrCodeUrl} download={`${pet.name}-qr-code.png`}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
