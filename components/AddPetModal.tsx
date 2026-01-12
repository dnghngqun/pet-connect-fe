"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import apiClient from "@/common/apiClient"

interface AddPetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddPetModal({ isOpen, onClose, onSuccess }: AddPetModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Chó",
    breed: "",
    gender: "MALE" as "MALE" | "FEMALE",
    age: "",
    bio: "",
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 5MB",
          variant: "destructive",
        })
        return
      }
      
      setAvatar(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      setIsUploadingAvatar(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'pets')

        const response = await apiClient.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success && response.data.data.url) {
          setAvatarUrl(response.data.data.url)
          toast({
            title: "Thành công",
            description: "Đã tải ảnh lên thành công",
          })
        }
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: "Không thể tải ảnh lên. Vui lòng thử lại.",
          variant: "destructive",
        })
        setAvatar(null)
        setAvatarPreview("")
      } finally {
        setIsUploadingAvatar(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.age) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    if (isUploadingAvatar) {
      toast({
        title: "Vui lòng đợi",
        description: "Đang tải ảnh lên...",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed || formData.type,
        gender: formData.gender,
        age: parseInt(formData.age),
        bio: formData.bio,
        profilePhoto: avatarUrl || undefined,
      }

      await apiClient.post("/api/v1/pets", requestData)

      toast({
        title: "Thành công",
        description: "Thú cưng đã được thêm thành công!",
        variant: "default",
      })

      // Reset form
      setFormData({
        name: "",
        type: "Chó",
        breed: "",
        gender: "MALE",
        age: "",
        bio: "",
      })
      setAvatar(null)
      setAvatarPreview("")
      setAvatarUrl("")

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm thú cưng",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-[#101914]/60 backdrop-blur-sm transition-opacity z-[99]"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">​</span>

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white dark:bg-[#2A1D1A] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100 dark:border-gray-700 z-[100]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#faf8f5]/50 dark:bg-[#221410]/50">
            <h3 className="text-xl font-bold text-[#1c110d] dark:text-white tracking-tight">
              Thêm thú cưng mới
            </h3>
            <button
              onClick={onClose}
              className="group rounded-full p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                close
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 bg-white dark:bg-[#2A1D1A] max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center mb-8">
                <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                  <div className="size-28 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-[#f05324]/50 group-hover:border-[#f05324] transition-colors overflow-hidden relative">
                    {isUploadingAvatar ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#f05324] border-t-transparent"></div>
                        <span className="text-xs text-[#f05324] mt-2">Đang tải...</span>
                      </div>
                    ) : avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[#f05324]/5 group-hover:bg-[#f05324]/10 transition-colors"></div>
                        <span className="material-symbols-outlined text-[#f05324] text-4xl group-hover:scale-110 transition-transform duration-300">
                          add_a_photo
                        </span>
                      </>
                    )}
                  </div>
                  {!isUploadingAvatar && (
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 text-[#1c110d] rounded-full p-1.5 shadow-md border-2 border-white dark:border-gray-600">
                      <span className="material-symbols-outlined text-[16px] text-[#f05324]">edit</span>
                    </div>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
                <span className="mt-3 text-sm font-medium text-[#9b5d4b] dark:text-gray-400">
                  {isUploadingAvatar ? "Đang tải ảnh lên..." : "Tải ảnh đại diện"}
                </span>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                {/* Pet Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-1.5">
                    Tên thú cưng <span className="text-[#f05324]">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#1c110d] dark:text-white placeholder-gray-400 focus:border-[#f05324] focus:ring-[#f05324] focus:ring-opacity-50 transition-shadow py-2.5"
                    placeholder="Nhập tên thú cưng của bạn"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-1.5">
                    Loại thú cưng
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#1c110d] dark:text-white focus:border-[#f05324] focus:ring-[#f05324] focus:ring-opacity-50 py-2.5"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Chó</option>
                    <option>Mèo</option>
                    <option>Chim</option>
                    <option>Khác</option>
                  </select>
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-1.5">
                    Giống loài
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#1c110d] dark:text-white placeholder-gray-400 focus:border-[#f05324] focus:ring-[#f05324] focus:ring-opacity-50 py-2.5"
                    placeholder="VD: Golden Retriever"
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-2">
                    Giới tính
                  </label>
                  <div className="flex items-center space-x-6 mt-2 h-[42px]">
                    <div className="flex items-center">
                      <input
                        className="size-4 text-[#f05324] border-gray-300 focus:ring-[#f05324]"
                        id="gender-male"
                        name="gender"
                        type="radio"
                        checked={formData.gender === "MALE"}
                        onChange={() => setFormData({ ...formData, gender: "MALE" })}
                      />
                      <label className="ml-2 block text-sm font-medium text-[#1c110d] dark:text-gray-300" htmlFor="gender-male">
                        Đực
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        className="size-4 text-[#f05324] border-gray-300 focus:ring-[#f05324]"
                        id="gender-female"
                        name="gender"
                        type="radio"
                        checked={formData.gender === "FEMALE"}
                        onChange={() => setFormData({ ...formData, gender: "FEMALE" })}
                      />
                      <label className="ml-2 block text-sm font-medium text-[#1c110d] dark:text-gray-300" htmlFor="gender-female">
                        Cái
                      </label>
                    </div>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-1.5">
                    Tuổi (tháng) <span className="text-[#f05324]">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#1c110d] dark:text-white focus:border-[#f05324] focus:ring-[#f05324] focus:ring-opacity-50 py-2.5"
                    placeholder="VD: 24"
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 mb-1.5">
                    Mô tả tính cách
                  </label>
                  <textarea
                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#1c110d] dark:text-white placeholder-gray-400 focus:border-[#f05324] focus:ring-[#f05324] focus:ring-opacity-50 py-2.5"
                    placeholder="Thú cưng của bạn có tính cách như thế nào?"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-[#221410]/50 px-6 py-4 sm:px-8 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row-reverse gap-3">
            <button
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-[#f05324] text-white font-bold hover:bg-[#d94317] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f05324] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang thêm..." : "Thêm thú cưng"}
            </button>
            <button
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2.5 bg-white dark:bg-[#2A1D1A] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  )
}
