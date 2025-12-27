'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  OrganizationReport,
  REPORT_REASONS,
} from '@/lib/organization-report.types';
import organizationReportService, { Organization } from '@/services/organizationReportService';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  Send,
  Loader2,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ImagePlus,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrganizationReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editReport?: OrganizationReport | null;
  onSuccess?: () => void;
}

const STEPS = [
  { id: 1, title: 'Chọn tổ chức', icon: Building2 },
  { id: 2, title: 'Chi tiết báo cáo', icon: FileText },
  { id: 3, title: 'Xác nhận & Gửi', icon: Send },
];

export default function OrganizationReportForm({
  open,
  onOpenChange,
  editReport,
  onSuccess,
}: OrganizationReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportedOrgIds, setReportedOrgIds] = useState<Set<number>>(new Set());

  // Form data
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [reason, setReason] = useState('');
  const [content, setContent] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);

  // Load organizations on mount
  useEffect(() => {
    if (open) {
      loadOrganizations();
      if (editReport) {
        // Convert OrganizationReport organization to service Organization
        const org: Organization = {
          id: Number(editReport.organization.id),
          name: editReport.organization.name,
          contactPerson: '',
          email: editReport.organization.email,
          phone: editReport.organization.phone,
          isVerified: editReport.organization.isVerified,
          createdAt: '',
          updatedAt: '',
          logo: editReport.organization.logo,
          city: editReport.organization.city,
          district: editReport.organization.district,
        };
        setSelectedOrg(org);
        setReason(editReport.reason);
        setContent(editReport.content);
        setEvidence([]);
        setEvidencePreviews([]);
        setCurrentStep(1);
      } else {
        resetForm();
      }
    }
  }, [open, editReport]);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      // Load both organizations and user's existing reports
      const [orgsResult, myReports] = await Promise.all([
        organizationReportService.getOrganizations(),
        organizationReportService.getMyReports(),
      ]);

      // Get IDs of organizations that user has already reported (not REFUSED - those can be edited)
      const alreadyReportedIds = new Set(
        myReports
          .filter(report => report.status !== 'REFUSED')
          .map(report => Number(report.organizationId))
      );
      setReportedOrgIds(alreadyReportedIds);

      // Filter out already reported organizations (unless editing)
      const availableOrgs = orgsResult.content.filter(
        org => !alreadyReportedIds.has(org.id)
      );
      setOrganizations(availableOrgs);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tổ chức',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedOrg(null);
    setReason('');
    setContent('');
    setEvidence([]);
    setEvidencePreviews([]);
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedOrg !== null;
      case 2:
        return reason !== '' && content.trim().length >= 20;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (canGoNext() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrg) return;

    setIsSubmitting(true);
    try {
      if (editReport) {
        await organizationReportService.updateReport(
          Number(editReport.id),
          { content }
        );
      } else {
        await organizationReportService.createReport({
          content,
          targetId: Number(selectedOrg.id),
          targetType: 'ORGANIZATION',
        });
      }

      toast({
        title: 'Thành công',
        description: 'Đã gửi báo cáo thành công',
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Submit report error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi báo cáo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real evidence upload handler
  const handleAddEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 5 - evidence.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Giới hạn ảnh',
        description: 'Bạn chỉ có thể tải tối đa 5 ảnh',
        variant: 'destructive',
      });
      return;
    }
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    const filesToAdd = Math.min(files.length, remainingSlots);
    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Lỗi',
          description: `${file.name} không phải là file ảnh`,
          variant: 'destructive',
        });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: `${file.name} vượt quá 5MB`,
          variant: 'destructive',
        });
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    if (newFiles.length > 0) {
      setEvidence(prev => [...prev, ...newFiles]);
      setEvidencePreviews(prev => [...prev, ...newPreviews]);
      toast({ title: 'Thành công', description: `Đã thêm ${newFiles.length} ảnh` });
    }
    
    e.target.value = '';
  };

  const handleRemoveEvidence = (index: number) => {
    URL.revokeObjectURL(evidencePreviews[index]);
    setEvidence(evidence.filter((_, i) => i !== index));
    setEvidencePreviews(evidencePreviews.filter((_, i) => i !== index));
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editReport ? 'Chỉnh sửa báo cáo tổ chức' : 'Tạo báo cáo tổ chức mới'}
          </DialogTitle>
          <DialogDescription>
            Giúp chúng tôi cải thiện cộng đồng bằng cách báo cáo các tổ chức vi phạm
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      isActive && 'bg-primary text-primary-foreground',
                      isCompleted && 'bg-green-500 text-white',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-1 font-medium',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-0.5 mx-2 mt-[-20px]',
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Step 1: Select Organization */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                placeholder="Tìm kiếm tổ chức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <ScrollArea className="h-[300px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredOrgs.map((org) => (
                      <div
                        key={org.id}
                        onClick={() => setSelectedOrg(org)}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-all hover:border-primary',
                          selectedOrg?.id === org.id && 'border-primary bg-primary/5 ring-1 ring-primary'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={org.logo} alt={org.name} />
                            <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold truncate">{org.name}</h4>
                              {org.isVerified && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{org.district}, {org.city}</span>
                            </div>
                          </div>
                          {selectedOrg?.id === org.id && (
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Step 2: Report Details */}
          {currentStep === 2 && (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Lý do báo cáo *</Label>
                  <RadioGroup value={reason} onValueChange={setReason}>
                    {REPORT_REASONS.map((r) => (
                      <div key={r.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={r.id} id={`reason-${r.id}`} />
                        <Label
                          htmlFor={`reason-${r.id}`}
                          className="font-normal cursor-pointer"
                        >
                          {r.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Nội dung chi tiết * (tối thiểu 20 ký tự)
                  </Label>
                  <Textarea
                    placeholder="Mô tả chi tiết vấn đề bạn muốn báo cáo..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length}/20 ký tự tối thiểu
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Bằng chứng (tùy chọn, tối đa 5 ảnh)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {evidencePreviews.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => handleRemoveEvidence(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {evidence.length < 5 && (
                      <label
                        className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs mt-1">Thêm ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAddEvidence}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && selectedOrg && (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Tổ chức bị báo cáo</h4>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedOrg.logo} alt={selectedOrg.name} />
                      <AvatarFallback>{selectedOrg.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedOrg.name}</span>
                        {selectedOrg.isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedOrg.district}, {selectedOrg.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedOrg.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Lý do báo cáo</h4>
                  <Badge variant="secondary">
                    {REPORT_REASONS.find(r => r.id === reason)?.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Nội dung chi tiết</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {content}
                  </p>
                </div>

                {evidencePreviews.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Bằng chứng đính kèm</h4>
                    <div className="flex flex-wrap gap-2">
                      {evidencePreviews.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {editReport?.status === 'REFUSED' && editReport.adminResponse && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                      Lý do từ chối lần trước
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {editReport.adminResponse.content}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep > 1 ? goToPrevStep : handleClose}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep > 1 ? 'Quay lại' : 'Hủy'}
          </Button>

          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button onClick={goToNextStep} disabled={!canGoNext()}>
                Tiếp theo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Gửi báo cáo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
