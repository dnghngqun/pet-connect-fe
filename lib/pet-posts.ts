import type { PetPost } from "@/lib/types"

export const petPosts: PetPost[] = [
  {
    id: "1",
    title: "Chó Husky mất tích tại quận 1, TP.HCM",
    slug: "cho-husky-mat-tich-quan-1",
    description: "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh, mất tích vào ngày 3/11 tại khu vực Nguyễn Hữu Cảnh. Nếu ai nhìn thấy vui lòng liên hệ ngay. Cảm ơn!",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
    petType: "Husky",
    status: "lost",
    location: "Quận 1, TP.HCM",
    postedBy: {
      id: "user1",
      name: "Nguyễn Văn A",
      phone: "0912345678",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-04T10:30:00Z",
    tags: ["lost", "husky", "urgent"],
    featured: true,
    views: 2450
  },
  {
    id: "2",
    title: "Chó con Golden Retriever cần nhà yêu thương",
    slug: "cho-golden-retriever-can-nha",
    description: "Bé Golden Retriever 2 tháng tuổi, khỏe mạnh, đã tiêm vaccine đầy đủ. Gia đình bị chuyển công tác nên cần tìm gia đình tốt để nuôi. Được huấn luyện cơ bản, rất thân thiện.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
    petType: "Golden Retriever",
    status: "for-adoption",
    location: "Quận 7, TP.HCM",
    postedBy: {
      id: "user2",
      name: "Trần Thị B",
      phone: "0987654321",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-03T14:20:00Z",
    tags: ["adoption", "golden-retriever", "healthy"],
    featured: true,
    views: 1890
  },
  {
    id: "3",
    title: "Mèo mèo hoang bị thương được cứu hộ",
    slug: "meo-hoang-bi-thuong",
    description: "Mèo mèo hoang bị xe cộ cán được đội cứu hộ PetAid cứu hộ. Đã được chữa trị, tiêm vaccine. Tìm gia đình để nuôi hoặc tài trợ cho trạm cứu hộ.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
    petType: "Mèo",
    status: "rescue",
    location: "Quận 2, TP.HCM",
    postedBy: {
      id: "org1",
      name: "Trạm Cứu Hộ PetAid",
      phone: "0868888888",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-02T09:15:00Z",
    tags: ["rescue", "cat", "need-support"],
    featured: false,
    views: 1340
  },
  {
    id: "4",
    title: "Chó Poodle trắng tìm thấy tại công viên Tao Đàn",
    slug: "cho-poodle-tim-thay",
    description: "Tìm thấy chó Poodle trắng, 3-4 tuổi, khỏe mạnh, không có vòng cổ. Nếu là chủ hãy liên hệ để nhận. Hiện đang được chăm sóc tại nhà tạm thời.",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800&auto=format&fit=crop",
    petType: "Poodle",
    status: "found",
    location: "Công viên Tao Đàn, Q1",
    postedBy: {
      id: "user3",
      name: "Phạm Minh C",
      phone: "0901234567",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-02T16:45:00Z",
    tags: ["found", "poodle"],
    featured: true,
    views: 890
  },
  {
    id: "5",
    title: "Mèo Ba Tư đen nhỏ cần nhà",
    slug: "meo-ba-tu-den",
    description: "Mèo Ba Tư đen nhỏ 6 tháng tuổi, vô cùng dễ thương và hiền lành. Đã khử trùng, tiêm vaccine. Tìm gia đình yêu thương cho bé.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
    petType: "Mèo Ba Tư",
    status: "for-adoption",
    location: "Quận 3, TP.HCM",
    postedBy: {
      id: "user4",
      name: "Võ Hoàng D",
      phone: "0923456789",
      avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-01T11:20:00Z",
    tags: ["adoption", "cat", "cute"],
    featured: false,
    views: 2100
  },
]

