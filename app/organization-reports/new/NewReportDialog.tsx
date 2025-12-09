"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

// 👉 Thêm type cho props ở đây
type NewReportDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};
export default function NewReportDialog({
  open,
  setOpen,
}: NewReportDialogProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    orgName: "",
    evidence: "",
    description: "",
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm mới báo cáo tổ chức</DialogTitle>
        </DialogHeader>

        {/* STEP */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-10 rounded-full ${
                step >= i ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium">Thông tin tổ chức</p>

            <div>
              <label className="text-sm font-medium">Tên tổ chức *</label>
              <Input
                placeholder="Ví dụ: PetAid Charity"
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              />
            </div>

            <Button className="w-full" onClick={next}>
              Tiếp tục <ArrowRight className="ml-2 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="font-medium">Bằng chứng</p>

            <Textarea
              placeholder="Mô tả bằng chứng hoặc link hình ảnh/video..."
              rows={5}
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={prev}>
                <ArrowLeft className="mr-2 w-4" /> Quay lại
              </Button>

              <Button onClick={next}>
                Tiếp tục <ArrowRight className="ml-2 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="font-medium">Mô tả chi tiết báo cáo</p>

            <Textarea
              rows={5}
              placeholder="Nhập mô tả chi tiết..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={prev}>
                <ArrowLeft className="mr-2 w-4" /> Quay lại
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  alert("Đã gửi báo cáo");
                  setOpen(false);
                }}
              >
                <Check className="mr-2 w-4" />
                Gửi báo cáo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
