'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  OrganizationReport,
  STATUS_CONFIG,
} from '@/lib/organization-report.types';
import organizationReportService from '@/services/organizationReportService';
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Clock,
  Edit,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';

interface OrganizationReportDetailProps {
  report: OrganizationReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (report: OrganizationReport) => void;
}

export default function OrganizationReportDetail({
  report,
  open,
  onOpenChange,
  onEdit,
}: OrganizationReportDetailProps) {
  if (!report) return null;

  const statusConfig = STATUS_CONFIG[report.status];
  const canEdit = organizationReportService.canEditReport(report);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REFUSED':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}>
              {getStatusIcon(report.status)}
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Organization Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Tổ chức bị báo cáo
              </h4>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={report.organization.logo} alt={report.organization.name} />
                  <AvatarFallback className="text-lg">
                    {report.organization.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{report.organization.name}</h3>
                    {report.organization.isVerified && (
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{report.organization.district}, {report.organization.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{report.organization.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{report.organization.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Report Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  Lý do báo cáo
                </h4>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {report.reasonLabel}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  Nội dung chi tiết
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {report.content}
                </p>
              </div>

              {report.evidence && report.evidence.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    Bằng chứng đính kèm ({report.evidence.length} ảnh)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.evidence.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={`Bằng chứng ${index + 1}`}
                          className="w-28 h-28 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Tạo: {formatDate(report.createdAt)}</span>
                </div>
                {report.updatedAt !== report.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Cập nhật: {formatDate(report.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Response */}
            {report.adminResponse && (
              <>
                <Separator />
                <div
                  className={`p-4 rounded-lg border-2 ${
                    report.status === 'RESOLVED'
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className={`h-5 w-5 ${
                      report.status === 'RESOLVED' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <h4 className={`font-semibold ${
                      report.status === 'RESOLVED' 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {report.status === 'RESOLVED' ? 'Phản hồi từ Admin' : 'Lý do từ chối'}
                    </h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    report.status === 'RESOLVED' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {report.adminResponse.content}
                  </p>
                  <div className={`mt-3 text-xs flex items-center gap-4 ${
                    report.status === 'RESOLVED' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <span>Người phản hồi: {report.adminResponse.respondedBy}</span>
                    <span>{formatDate(report.adminResponse.respondedAt)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Refused Status - Call to Action */}
            {report.status === 'REFUSED' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">
                      Bạn có thể chỉnh sửa và gửi lại
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Vui lòng bổ sung thông tin hoặc bằng chứng theo yêu cầu của Admin và gửi lại báo cáo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {canEdit && onEdit && (
            <Button onClick={() => onEdit(report)}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
