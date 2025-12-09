"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, MoreVertical, Search, FileWarning } from "lucide-react";
import NewReportDialog from "./new/NewReportDialog";
import Link from "next/link";

// 👉 Thêm type cho props ở đây
type ReportHistory = {
  id: number;
  orgName: string;
  content: string;
  date: string;
  status: "draft" | "pending" | "resolved" | "rejected";
};

export default function ReportHistoryPage() {
  const [openNewReport, setOpenNewReport] = useState(false);

  const reports: ReportHistory[] = [
    {
      id: 1,
      orgName: "Tổ chức AID PET",
      content: "Tổ chức có dấu hiệu lừa đảo nhận quyên góp...",
      date: "01/12/2024",
      status: "draft",
    },
    {
      id: 2,
      orgName: "Hội cứu trợ động vật Q7",
      content: "Nghi ngờ tổ chức sử dụng sai mục đích quyên góp...",
      date: "25/11/2024",
      status: "pending",
    },
    {
      id: 3,
      orgName: "PetGroup Charity",
      content: "Đã xác minh vi phạm, tổ chức bị nhắc nhở...",
      date: "20/11/2024",
      status: "resolved",
    },
    {
      id: 4,
      orgName: "PetLove Shelter",
      content: "Thiếu minh bạch khi kêu gọi quyên góp...",
      date: "18/10/2024",
      status: "rejected",
    },
  ];

  type ReportStatus = "draft" | "pending" | "resolved" | "rejected";

  const statusMap: Record<ReportStatus, { label: string; color: string }> = {
    draft: { label: "Lưu nháp", color: "gray" },
    pending: { label: "Chờ xử lý", color: "yellow" },
    resolved: { label: "Đã xử lý", color: "green" },
    rejected: { label: "Từ chối", color: "red" },
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử báo cáo tổ chức</h1>
          <p className="text-muted-foreground">
            Xem lại các báo cáo bạn đã gửi
          </p>
        </div>

        <Button onClick={() => setOpenNewReport(true)} className="gap-2">
          <Plus size={18} /> Thêm mới báo cáo
        </Button>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-sm">
            <CardHeader className="flex flex-row justify-between">
              <Badge className={statusMap[report.status].color}>
                {statusMap[report.status].label}
              </Badge>

              <MoreVertical className="text-gray-500 w-5 h-5" />
            </CardHeader>

            <CardContent>
              <h2 className="font-semibold text-lg mb-2">{report.orgName}</h2>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {report.content}
              </p>

              <p className="text-xs text-gray-500 mt-3">{report.date}</p>

              <Link href={`/reports/${report.id}`}>
                <Button variant="outline" className="w-full mt-4">
                  Xem chi tiết
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popup */}
      <NewReportDialog open={openNewReport} setOpen={setOpenNewReport} />
    </div>
  );
}
