// Organization Report Service - Fake API with mock data

import {
  OrganizationReport,
  Organization,
  ReportStatus,
} from '@/lib/organization-report.types';
import {
  mockOrganizations,
  getAllReports,
  getReportById as getReportByIdMock,
  addReport,
  updateReportLocal,
} from '@/lib/organization-report.mock';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CreateReportData {
  organizationId: string;
  reason: string;
  reasonLabel: string;
  content: string;
  evidence?: string[];
}

interface UpdateReportData {
  reason?: string;
  reasonLabel?: string;
  content?: string;
  evidence?: string[];
}

const organizationReportService = {
  // Get all organizations for selection
  async getOrganizations(): Promise<Organization[]> {
    await delay(300);
    return mockOrganizations;
  },

  // Get user's reports
  async getMyReports(status?: ReportStatus): Promise<OrganizationReport[]> {
    await delay(400);
    const reports = getAllReports();
    if (status) {
      return reports.filter(r => r.status === status);
    }
    return reports;
  },

  // Get report by ID
  async getReportById(id: string): Promise<OrganizationReport | null> {
    await delay(200);
    const report = getReportByIdMock(id);
    return report || null;
  },

  // Create new report - always CREATED status, no draft
  async createReport(data: CreateReportData): Promise<OrganizationReport> {
    await delay(500);
    
    const organization = mockOrganizations.find(o => o.id === data.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Status = RECEIVED (chờ xử lý) - gửi là vào trạng thái chờ Admin duyệt luôn
    const newReport = addReport({
      organizationId: data.organizationId,
      organization,
      reporterId: 'user-001', // Mock current user
      reason: data.reason,
      reasonLabel: data.reasonLabel,
      content: data.content,
      evidence: data.evidence,
      status: 'RECEIVED',
    });

    return newReport;
  },

  // Update existing report - only when REFUSED
  async updateReport(
    id: string,
    data: UpdateReportData
  ): Promise<OrganizationReport> {
    await delay(400);
    
    const existingReport = getReportByIdMock(id);
    if (!existingReport) {
      throw new Error('Report not found');
    }

    // Only allow editing REFUSED reports
    if (existingReport.status !== 'REFUSED') {
      throw new Error('Chỉ có thể chỉnh sửa báo cáo bị từ chối');
    }

    // Reset to RECEIVED when resubmitting (chờ xử lý lại)
    const updated = updateReportLocal(id, {
      ...data,
      status: 'RECEIVED',
      // Clear admin response when resubmitting
      adminResponse: undefined,
    });

    if (!updated) {
      throw new Error('Failed to update report');
    }

    return updated;
  },

  // Check if report can be edited (only REFUSED)
  canEditReport(report: OrganizationReport): boolean {
    return report.status === 'REFUSED';
  },

  // Get organization by ID
  async getOrganizationById(id: string): Promise<Organization | null> {
    await delay(100);
    const org = mockOrganizations.find(o => o.id === id);
    return org || null;
  },
};

export default organizationReportService;
