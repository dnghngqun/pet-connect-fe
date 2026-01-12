'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PetProfile } from '@/lib/types';
import { Activity, Heart, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface PetHealthProfileProps {
  pet: PetProfile;
}

export default function PetHealthProfile({ pet }: PetHealthProfileProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="vaccinations">Tiêm chủng</TabsTrigger>
        <TabsTrigger value="medical">Lịch sử</TabsTrigger>
        <TabsTrigger value="details">Chi tiết</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên</p>
                <p className="font-semibold">{pet.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loại</p>
                <p className="font-semibold">{pet.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tuổi</p>
                <p className="font-semibold">
                  {Math.floor(pet.age / 12)} năm {pet.age % 12} tháng
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giới tính</p>
                <p className="font-semibold">
                  {pet.gender === 'male' ? '🐾 Đực' : '🐾 Cái'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cân nặng</p>
                <p className="font-semibold">{pet.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kích thước</p>
                <p className="font-semibold capitalize">
                  {pet.size === 'small' ? 'Nhỏ' : pet.size === 'medium' ? 'Vừa' : 'Lớn'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tính cách & Đặc điểm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tính cách</p>
              {pet.personality && pet.personality.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pet.personality.map((trait) => (
                    <Badge key={trait} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Chưa có thông tin</p>
              )}
            </div>
            {pet.color && (
              <div>
                <p className="text-sm text-muted-foreground">Màu sắc</p>
                <p className="font-semibold">{pet.color}</p>
              </div>
            )}
            {pet.specialNeeds && pet.specialNeeds !== 'Không có' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Nhu cầu đặc biệt</p>
                    <p className="text-sm text-yellow-700">{pet.specialNeeds}</p>
                  </div>
                </div>
              </div>
            )}
            {pet.bio && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tiểu sử</p>
                <p className="text-sm leading-relaxed">{pet.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Trạng thái sức khỏe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Tiêm chủng</span>
              </div>
              <Badge className="bg-green-600">Cập nhật</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Kiểm tra cuối cùng</span>
              </div>
              <span className="text-sm font-semibold">
                {new Date(pet.healthRecord.lastCheckup).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {pet.healthRecord.allergies && pet.healthRecord.allergies.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="font-semibold text-sm mb-2">Dị ứng</p>
                <div className="flex flex-wrap gap-2">
                  {pet.healthRecord.allergies.map((allergy) => (
                    <Badge key={allergy} variant="outline" className="border-orange-300">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Vaccinations Tab */}
      <TabsContent value="vaccinations">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lịch tiêm chủng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pet.healthRecord.vaccinations.length > 0 ? (
              pet.healthRecord.vaccinations.map((vac, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{vac.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Ngay tiem: {new Date((vac as any).vaccinationDate || vac.date).toLocaleDateString('vi-VN')}</span>
                        {((vac as any).nextDueDate || vac.nextDue) && (
                          <span>Lan toi: {new Date((vac as any).nextDueDate || vac.nextDue).toLocaleDateString('vi-VN')}</span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-600">✓ Đã tiêm</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Chưa có thông tin tiêm chủng</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Medical History Tab */}
      <TabsContent value="medical">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lịch sử y tế</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pet.healthRecord.medicalHistory.length > 0 ? (
              pet.healthRecord.medicalHistory.map((history, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{history.condition}</p>
                        {(history as any).weight && (
                          <span className="text-sm text-green-600 font-medium">• {(history as any).weight} kg</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ngày khám: {new Date((history as any).visitDate || history.date).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Điều trị:</span> {history.treatment}
                      </p>
                      {history.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          <span className="font-semibold">Ghi chú:</span> {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Chưa có lịch sử y tế</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú y tế</CardTitle>
            </CardHeader>
            <CardContent>
              {pet.healthRecord.notes ? (
                <p className="text-sm leading-relaxed">{pet.healthRecord.notes}</p>
              ) : (
                <p className="text-muted-foreground text-center py-4">Chưa có ghi chú</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

