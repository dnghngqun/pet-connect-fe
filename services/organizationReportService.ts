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

  // Create new report
  async createReport(data: CreateReportData, isDraft: boolean = false): Promise<OrganizationReport> {
    await delay(500);
    
    const organization = mockOrganizations.find(o => o.id === data.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const newReport = addReport({
      organizationId: data.organizationId,
      organization,
      reporterId: 'user-001', // Mock current user
      reason: data.reason,
      reasonLabel: data.reasonLabel,
      content: data.content,
      evidence: data.evidence,
      status: isDraft ? 'DRAFT' : 'PENDING',
    });

    return newReport;
  },

  // Update existing report
  async updateReport(
    id: string,
    data: UpdateReportData,
    isDraft: boolean = false
  ): Promise<OrganizationReport> {
    await delay(400);
    
    const existingReport = getReportByIdMock(id);
    if (!existingReport) {
      throw new Error('Report not found');
    }

    // Only allow editing DRAFT or REFUSED reports
    if (!['DRAFT', 'REFUSED'].includes(existingReport.status)) {
      throw new Error('Cannot edit report with current status');
    }

    const updated = updateReportLocal(id, {
      ...data,
      status: isDraft ? 'DRAFT' : 'PENDING',
      // Clear admin response when resubmitting
      adminResponse: isDraft ? existingReport.adminResponse : undefined,
    });

    if (!updated) {
      throw new Error('Failed to update report');
    }

    return updated;
  },

  // Submit draft report
  async submitReport(id: string): Promise<OrganizationReport> {
    await delay(300);
    
    const existingReport = getReportByIdMock(id);
    if (!existingReport) {
      throw new Error('Report not found');
    }

    if (existingReport.status !== 'DRAFT') {
      throw new Error('Only draft reports can be submitted');
    }

    const updated = updateReportLocal(id, {
      status: 'PENDING',
    });

    if (!updated) {
      throw new Error('Failed to submit report');
    }

    return updated;
  },

  // Check if report can be edited
  canEditReport(report: OrganizationReport): boolean {
    return ['DRAFT', 'REFUSED'].includes(report.status);
  },

  // Get organization by ID
  async getOrganizationById(id: string): Promise<Organization | null> {
    await delay(100);
    const org = mockOrganizations.find(o => o.id === id);
    return org || null;
  },
};

export default organizationReportService;
