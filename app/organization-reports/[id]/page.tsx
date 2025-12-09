import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReportDetailPage() {
  const report = {
    id: 4,
    orgName: "PetLove Shelter",
    description:
      "Tổ chức thiếu minh bạch khi kêu gọi quyên góp. Không cung cấp báo cáo tài chính...",
    evidence: "Hình ảnh + video được đính kèm...",
    status: "rejected",
    rejectReason:
      "Nội dung báo cáo chưa đủ bằng chứng thuyết phục. Vui lòng bổ sung thông tin.",
    adminReply:
      "Chúng tôi đã xem xét báo cáo và gửi lại yêu cầu bổ sung thông tin...",
  };

  return (
    <div className="container px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">
        Báo cáo: {report.orgName}
      </h1>

      <Badge className="mb-4 bg-red-200 text-red-800">
        {report.status === "rejected" ? "Từ chối xử lý" : ""}
      </Badge>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Nội dung báo cáo</h2>
          <p className="text-gray-700">{report.description}</p>
        </div>

        <div>
          <h2 className="font-semibold">Bằng chứng</h2>
          <p className="text-gray-700">{report.evidence}</p>
        </div>

        {report.status === "rejected" && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="font-semibold text-red-700">Lý do từ chối</p>
            <p className="text-red-700">{report.rejectReason}</p>
          </div>
        )}

        <div>
          <h2 className="font-semibold">Phản hồi từ admin</h2>
          <p className="text-gray-700">{report.adminReply}</p>
        </div>

        <Button className="mt-4">Chỉnh sửa báo cáo</Button>
      </div>
    </div>
  );
}
