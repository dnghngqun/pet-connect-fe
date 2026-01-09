
import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
export interface Organization {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  logo?: string;
  city?: string;
  district?: string;
  address?: string;
  followerCount?: number;
}
export interface AdminResponse {
  content: string;
  respondedAt: string;
  respondedBy: string;
}
export interface ReportListItem {
  id: number;
  content: string;
  status: string;
  targetType: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  adminResponse: AdminResponse | null;
}
export interface ReportDetail {
  id: number;
  content: string;
  status: string;
  targetId: number;
  targetType: string;
  reporterId: number;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  adminResponse: AdminResponse | null;
}

export interface CreateReportRequest {
  content: string;
  targetId: number;
  targetType: string;
}

export interface UpdateReportRequest {
  content: string;
}
import {
  OrganizationReport,
  ReportStatus,
} from '@/lib/organization-report.types';
function transformToFrontendReport(item: ReportListItem | ReportDetail): OrganizationReport {
  return {
    id: String(item.id),
    organizationId: String(item.organization.id),
    organization: {
      id: String(item.organization.id),
      name: item.organization.name,
      logo: '',
      email: item.organization.email || '',
      phone: item.organization.phone || '',
      address: '',
      city: item.organization.city || '',
      district: item.organization.district || '',
      isVerified: item.organization.isVerified || false,
      followerCount: 0,
    },
    reporterId: 'targetId' in item ? String(item.reporterId) : '',
    reason: 'other',
    reasonLabel: 'Khác',
    content: item.content,
    status: item.status as ReportStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    adminResponse: item.adminResponse ? {
      content: item.adminResponse.content,
      respondedAt: item.adminResponse.respondedAt,
      respondedBy: item.adminResponse.respondedBy,
    } : undefined,
  };
}

const organizationReportService = {
  /**
   * API 1: Get user's reports
   * GET /api/v1/reports/my-reports
   */
  async getMyReports(status?: string): Promise<OrganizationReport[]> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ReportListItem>>>(COMMON_API.myReports, {
      params: {
        status,
        page: 0,
        size: 100,
        sort: 'createdAt,desc',
      },
    });
    
    const items = response.data.data?.content || [];
    return items.map(transformToFrontendReport);
  },

  /**
   * API 2: Get report detail
   * GET /api/v1/reports/{id}
   */
  async getReportDetail(id: number): Promise<OrganizationReport> {
    const response = await apiClient.get<ApiResponse<ReportDetail>>(COMMON_API.reportDetail(id));
    return transformToFrontendReport(response.data.data);
  },

  /**
   * API 3: Create report
   * POST /api/v1/reports
   */
  async createReport(data: CreateReportRequest): Promise<OrganizationReport | null> {
    const response = await apiClient.post<ApiResponse<ReportDetail>>(COMMON_API.reports, data);
    const reportData = response.data?.data;
    if (!reportData) {
      console.log('Create report response:', response.data);
      return null;
    }
    return transformToFrontendReport(reportData);
  },

  /**
   * API 4: Update refused report
   * PUT /api/v1/reports/{id}
   */
  async updateReport(id: number, data: UpdateReportRequest): Promise<OrganizationReport> {
    const response = await apiClient.put<ApiResponse<ReportDetail>>(COMMON_API.reportDetail(id), data);
    return transformToFrontendReport(response.data.data);
  },

  /**
   * Check if report can be edited (only REFUSED status)
   */
  canEditReport(report: OrganizationReport): boolean {
    return report.status === 'REFUSED';
  },

  /**
   * Get organizations list for creating report
   * GET /api/v1/organizations
   */
  async getOrganizations(search?: string, page = 1, size = 20): Promise<{ content: Organization[]; total: number }> {
    const response = await apiClient.get(COMMON_API.organizations, {
      params: { search, page, size },
    });

    const data = response.data.data;
    return {
      content: data.rescueGroups?.items || [],
      total: data.rescueGroups?.total || 0,
    };
  },
};

export default organizationReportService;
