import { COMMON_API } from "@/common/Constant/COMMON_API";
import apiClient from "@/common/apiClient";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CreateReportPayload {
  targetId: number;
  targetType: "POST" | "USER" | "ORGANIZATION";
  content: string;
}

const reportService = {
  async createReport(payload: CreateReportPayload): Promise<ApiResponse<any>> {
    const res = await apiClient.post(COMMON_API.reports, payload);
    return res.data;
  },
};

export default reportService;
