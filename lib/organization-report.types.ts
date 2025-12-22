// Organization Report Types

// Matching DB: reports.status CHECK (CREATED, RECEIVED, RESOLVED, REFUSED)
export type ReportStatus = 'CREATED' | 'RECEIVED' | 'RESOLVED' | 'REFUSED';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  isVerified: boolean;
  followerCount: number;
  description?: string;
}

export interface AdminResponse {
  content: string;
  respondedAt: string;
  respondedBy: string;
}

export interface OrganizationReport {
  id: string;
  organizationId: string;
  organization: Organization;
  reporterId: string;
  reason: string;
  reasonLabel: string;
  content: string;
  evidence?: string[]; // URLs of uploaded images
  status: ReportStatus;
  adminResponse?: AdminResponse;
  createdAt: string;
  updatedAt: string;
}

export const REPORT_REASONS = [
  { id: 'scam', label: 'Lừa đảo, gian dối' },
  { id: 'false_info', label: 'Thông tin sai lệch' },
  { id: 'animal_abuse', label: 'Nghi ngờ ngược đãi động vật' },
  { id: 'unprofessional', label: 'Hoạt động không chuyên nghiệp' },
  { id: 'illegal', label: 'Hoạt động phi pháp' },
  { id: 'bad_service', label: 'Dịch vụ kém chất lượng' },
  { id: 'other', label: 'Lý do khác' },
] as const;

// Matching DB status values
// Note: CREATED is kept for DB compatibility but treated same as RECEIVED in UI
export const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bgColor: string }> = {
  CREATED: { label: 'Chờ xử lý', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  RECEIVED: { label: 'Chờ xử lý', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  RESOLVED: { label: 'Đã xử lý', color: 'text-green-700', bgColor: 'bg-green-100' },
  REFUSED: { label: 'Từ chối', color: 'text-red-700', bgColor: 'bg-red-100' },
};
