'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function CreateFundraisingPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medical',
    targetAmount: '',
    image: '',
    relatedPetName: '',
    beneficiary: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Tạo chiến dịch thành công!",
      description: "Chiến dịch gây quỹ của bạn đã được tạo và đang chờ xét duyệt.",
    })
    setFormData({
      title: '',
      description: '',
      category: 'medical',
      targetAmount: '',
      image: '',
      relatedPetName: '',
      beneficiary: '',
    })
    setIsSubmitting(false)
  }

  return (
    <div className="container px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/fundraising">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Tạo chiến dịch gây quỹ</CardTitle>
          <p className="text-muted-foreground mt-2">
            Chia sẻ câu chuyện và kêu gọi sự giúp đỡ của cộng đồng
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tiêu đề chiến dịch *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Cứu chó Husky bị tai nạn"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Danh mục *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="medical">🏥 Y tế</option>
                <option value="rescue">🆘 Cứu hộ</option>
                <option value="shelter">🏠 Nơi trú ẩn</option>
                <option value="food">🍖 Thức ăn</option>
                <option value="other">📌 Khác</option>
              </select>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Mục tiêu quyên góp (VND) *
              </label>
              <Input
                name="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="5000000"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Mô tả chi tiết *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Hãy kể về tình huống, lý do cần quyên góp, và tác động của việc quyên góp..."
                rows={6}
                required
              />
            </div>

            {/* Pet Name (Optional) */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tên thú cưng liên quan (tùy chọn)
              </label>
              <Input
                name="relatedPetName"
                value={formData.relatedPetName}
                onChange={handleChange}
                placeholder="Ví dụ: Max"
              />
            </div>

            {/* Beneficiary */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tổ chức hưởng lợi (tùy chọn)
              </label>
              <Input
                name="beneficiary"
                value={formData.beneficiary}
                onChange={handleChange}
                placeholder="Ví dụ: Trạm Cứu Hộ PetAid"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                URL ảnh đại diện (tùy chọn)
              </label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
              />
              {formData.image && (
                <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="border-t pt-6 flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo chiến dịch'}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                size="lg"
              >
                <Link href="/fundraising">Hủy</Link>
              </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-2">💡 Mẹo:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Hãy kể một câu chuyện cảm động để thu hút sự quan tâm</li>
                <li>Đảm bảo mục tiêu quyên góp hợp lý và chi tiết</li>
                <li>Cập nhật tiến độ của chiến dịch thường xuyên</li>
                <li>Cảm ơn mọi người đã đóng góp</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

