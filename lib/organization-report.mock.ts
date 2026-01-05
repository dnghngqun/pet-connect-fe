// Mock data for Organization Reports

import { Organization, OrganizationReport, ReportStatus } from './organization-report.types';

// Mock Organizations
export const mockOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Trung tâm cứu hộ động vật Sài Gòn',
    logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100',
    email: 'cuuho.saigon@example.com',
    phone: '0901234567',
    address: '123 Đường Nguyễn Văn Linh',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    isVerified: true,
    followerCount: 5420,
    description: 'Trung tâm cứu hộ và chăm sóc động vật hoang dã và thú cưng bị bỏ rơi.',
  },
  {
    id: 'org-002',
    name: 'Hội bảo vệ động vật Việt Nam',
    logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100',
    email: 'hoidongvat@example.com',
    phone: '0912345678',
    address: '456 Đường Lê Lợi',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    isVerified: true,
    followerCount: 12300,
    description: 'Tổ chức phi lợi nhuận bảo vệ quyền lợi động vật.',
  },
  {
    id: 'org-003',
    name: 'Nhà Yêu Chó Mèo',
    logo: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=100',
    email: 'nhayeuchomeo@example.com',
    phone: '0923456789',
    address: '789 Đường Cách Mạng Tháng 8',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    isVerified: false,
    followerCount: 2100,
    description: 'Cộng đồng nhận nuôi và chăm sóc chó mèo hoang.',
  },
  {
    id: 'org-004',
    name: 'Trạm cứu hộ thú cưng Hà Nội',
    logo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100',
    email: 'cuuho.hanoi@example.com',
    phone: '0934567890',
    address: '321 Đường Hoàng Hoa Thám',
    city: 'Hà Nội',
    district: 'Ba Đình',
    isVerified: true,
    followerCount: 8900,
    description: 'Trạm cứu hộ và điều trị thú cưng tại Hà Nội.',
  },
  {
    id: 'org-005',
    name: 'Pet Care Vietnam',
    logo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=100',
    email: 'petcare.vn@example.com',
    phone: '0945678901',
    address: '567 Đường Nguyễn Huệ',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    isVerified: false,
    followerCount: 3500,
    description: 'Dịch vụ chăm sóc thú cưng toàn diện.',
  },
  {
    id: 'org-006',
    name: 'Thiên đường thú cưng',
    logo: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=100',
    email: 'thiendang@example.com',
    phone: '0956789012',
    address: '890 Đường Võ Văn Tần',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    isVerified: true,
    followerCount: 6700,
    description: 'Trung tâm nhận nuôi và chăm sóc thú cưng cao cấp.',
  },
];

// Mock Reports with different statuses
export const mockReports: OrganizationReport[] = [
  {
    id: 'rpt-001',
    organizationId: 'org-003',
    organization: mockOrganizations.find(o => o.id === 'org-003')!,
    reporterId: 'user-001',
    reason: 'scam',
    reasonLabel: 'Lừa đảo, gian dối',
    content: 'Tổ chức này yêu cầu đóng phí nhận nuôi rất cao (5 triệu đồng) nhưng không cung cấp giấy tờ tiêm phòng và sổ sức khỏe cho thú cưng. Khi hỏi thì trả lời mập mờ.',
    evidence: [
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400',
    ],
    status: 'PENDING',
    createdAt: '2024-12-15T08:30:00Z',
    updatedAt: '2024-12-15T08:30:00Z',
  },
  {
    id: 'rpt-002',
    organizationId: 'org-005',
    organization: mockOrganizations.find(o => o.id === 'org-005')!,
    reporterId: 'user-001',
    reason: 'animal_abuse',
    reasonLabel: 'Nghi ngờ ngược đãi động vật',
    content: 'Tôi đã đến thăm trung tâm và thấy nhiều thú cưng bị nhốt trong lồng chật hẹp, không có nước uống. Một số con có dấu hiệu bị thương nhưng không được chăm sóc y tế.',
    evidence: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    ],
    status: 'RESOLVED',
    adminResponse: {
      content: 'Cảm ơn bạn đã báo cáo. Chúng tôi đã kiểm tra và xác nhận thông tin. Tổ chức này đã bị cảnh cáo và yêu cầu cải thiện điều kiện chăm sóc thú cưng trong vòng 30 ngày. Chúng tôi sẽ tiếp tục theo dõi.',
      respondedAt: '2024-12-18T14:00:00Z',
      respondedBy: 'Admin Minh',
    },
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-18T14:00:00Z',
  },
  {
    id: 'rpt-003',
    organizationId: 'org-001',
    organization: mockOrganizations.find(o => o.id === 'org-001')!,
    reporterId: 'user-001',
    reason: 'false_info',
    reasonLabel: 'Thông tin sai lệch',
    content: 'Tổ chức đăng tin có nhiều thú cưng cần nhận nuôi nhưng khi liên hệ thì nói đã có người nhận hết.',
    status: 'PENDING',
    createdAt: '2024-12-20T16:45:00Z',
    updatedAt: '2024-12-20T16:45:00Z',
  },
  {
    id: 'rpt-004',
    organizationId: 'org-006',
    organization: mockOrganizations.find(o => o.id === 'org-006')!,
    reporterId: 'user-001',
    reason: 'bad_service',
    reasonLabel: 'Dịch vụ kém chất lượng',
    content: 'Tôi đã nhận nuôi một chú mèo từ tổ chức này. Họ cam kết mèo đã tiêm phòng đầy đủ và khỏe mạnh. Tuy nhiên sau 2 ngày, mèo bị ốm nặng và bác sĩ thú y xác nhận mèo chưa được tiêm phòng và có dấu hiệu suy dinh dưỡng.',
    evidence: [
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
    ],
    status: 'REFUSED',
    adminResponse: {
      content: 'Chúng tôi đã xem xét báo cáo của bạn. Tuy nhiên, theo thông tin từ tổ chức và hồ sơ y tế, mèo đã được tiêm phòng đầy đủ trước khi nhận nuôi. Bạn vui lòng cung cấp thêm giấy khám bệnh từ phòng khám thú y và hóa đơn tiêm phòng (nếu có) để chúng tôi xem xét lại.',
      respondedAt: '2024-12-19T11:30:00Z',
      respondedBy: 'Admin Hương',
    },
    createdAt: '2024-12-12T09:15:00Z',
    updatedAt: '2024-12-19T11:30:00Z',
  },
  {
    id: 'rpt-005',
    organizationId: 'org-002',
    organization: mockOrganizations.find(o => o.id === 'org-002')!,
    reporterId: 'user-001',
    reason: 'unprofessional',
    reasonLabel: 'Hoạt động không chuyên nghiệp',
    content: 'Nhân viên của tổ chức này rất thiếu chuyên nghiệp. Khi tôi hỏi về quy trình nhận nuôi, họ trả lời cộc lốc và không cung cấp thông tin đầy đủ.',
    status: 'PENDING',
    createdAt: '2024-12-21T13:20:00Z',
    updatedAt: '2024-12-21T13:20:00Z',
  },
];

// Helper function to get reports by status
export function getReportsByStatus(status?: ReportStatus): OrganizationReport[] {
  if (!status) return mockReports;
  return mockReports.filter(r => r.status === status);
}

// Helper function to get report by id
export function getReportById(id: string): OrganizationReport | undefined {
  return mockReports.find(r => r.id === id);
}

// Simulated local storage for state management
let localReports = [...mockReports];
let nextReportId = 6;

export function getAllReports(): OrganizationReport[] {
  return localReports;
}

export function addReport(report: Omit<OrganizationReport, 'id' | 'createdAt' | 'updatedAt'>): OrganizationReport {
  const newReport: OrganizationReport = {
    ...report,
    id: `rpt-00${nextReportId++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localReports = [newReport, ...localReports];
  return newReport;
}

export function updateReportLocal(id: string, updates: Partial<OrganizationReport>): OrganizationReport | undefined {
  const index = localReports.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  
  localReports[index] = {
    ...localReports[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return localReports[index];
}

export function resetMockData(): void {
  localReports = [...mockReports];
  nextReportId = 6;
}
