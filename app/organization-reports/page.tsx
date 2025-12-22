'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Eye,
  Edit,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Flag,
} from 'lucide-react';
import {
  OrganizationReport,
  ReportStatus,
  STATUS_CONFIG,
} from '@/lib/organization-report.types';
import organizationReportService from '@/services/organizationReportService';
import OrganizationReportForm from '@/components/organization-report-form';
import OrganizationReportDetail from '@/components/organization-report-detail';
import authService from '@/services/authService';

type FilterTab = 'all' | ReportStatus;

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tất cả', icon: FileText },
  { id: 'DRAFT', label: 'Lưu nháp', icon: FileText },
  { id: 'PENDING', label: 'Chờ xử lý', icon: Clock },
  { id: 'RESOLVED', label: 'Đã xử lý', icon: CheckCircle },
  { id: 'REFUSED', label: 'Từ chối', icon: XCircle },
];

export default function OrganizationReportsPage() {
  const [reports, setReports] = useState<OrganizationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<OrganizationReport | null>(null);
  const [editingReport, setEditingReport] = useState<OrganizationReport | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsLoggedIn(!!user);
    setCheckingAuth(false);
    if (user) {
      loadReports();
    }
  }, []);

  const loadReports = async (status?: ReportStatus) => {
    setIsLoading(true);
    try {
      const data = await organizationReportService.getMyReports(status);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    const filter = value as FilterTab;
    setActiveFilter(filter);
    loadReports(filter === 'all' ? undefined : filter);
  };

  const handleViewDetail = (report: OrganizationReport) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleEdit = (report: OrganizationReport) => {
    setEditingReport(report);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingReport(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadReports(activeFilter === 'all' ? undefined : activeFilter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-3.5 w-3.5" />;
      case 'PENDING':
        return <Clock className="h-3.5 w-3.5" />;
      case 'RESOLVED':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'REFUSED':
        return <XCircle className="h-3.5 w-3.5" />;
    }
  };

  if (checkingAuth) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Đang kiểm tra...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
            <p className="text-muted-foreground mb-4">
              Bạn cần đăng nhập để xem và quản lý các báo cáo tổ chức của mình.
            </p>
            <Button onClick={() => (window.location.href = '/sign-in')}>
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flag className="h-8 w-8 text-primary" />
              Báo cáo tổ chức
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các báo cáo về tổ chức của bạn
            </p>
          </div>
          <Button onClick={handleCreateNew} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Thêm mới báo cáo
          </Button>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lịch sử báo cáo</CardTitle>
            <CardDescription>
              Danh sách các báo cáo tổ chức bạn đã gửi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={handleFilterChange} className="mb-4">
              <TabsList className="flex flex-wrap h-auto gap-1">
                {FILTER_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Reports Table */}
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có báo cáo nào</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilter === 'all'
                    ? 'Bạn chưa tạo báo cáo tổ chức nào.'
                    : `Không có báo cáo nào ở trạng thái "${STATUS_CONFIG[activeFilter as ReportStatus]?.label}".`}
                </p>
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo báo cáo đầu tiên
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Tổ chức</TableHead>
                      <TableHead className="min-w-[150px]">Lý do</TableHead>
                      <TableHead className="min-w-[100px]">Ngày tạo</TableHead>
                      <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                      <TableHead className="text-right min-w-[150px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const statusConfig = STATUS_CONFIG[report.status];
                      const canEdit = organizationReportService.canEditReport(report);

                      return (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={report.organization.logo}
                                  alt={report.organization.name}
                                />
                                <AvatarFallback>
                                  {report.organization.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium line-clamp-1">
                                  {report.organization.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {report.organization.district}, {report.organization.city}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{report.reasonLabel}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(report.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}>
                              {getStatusIcon(report.status)}
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(report)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(report)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Sửa
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card className="mt-6">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Chú thích trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge className={`${config.bgColor} ${config.color} gap-1`}>
                    {getStatusIcon(status as ReportStatus)}
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {status === 'DRAFT' && '- Có thể chỉnh sửa'}
                    {status === 'PENDING' && '- Đang chờ Admin'}
                    {status === 'RESOLVED' && '- Đã hoàn tất'}
                    {status === 'REFUSED' && '- Có thể gửi lại'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <OrganizationReportForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editReport={editingReport}
        onSuccess={handleFormSuccess}
      />

      <OrganizationReportDetail
        report={selectedReport}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEdit}
      />
    </div>
  );
}
