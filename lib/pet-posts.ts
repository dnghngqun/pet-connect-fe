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
    locationCoords: {
      latitude: 10.7769,
      longitude: 106.7009
    },
    postedBy: {
      id: "user1",
      name: "Nguyễn Văn A",
      phone: "0912345678",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-04T10:30:00Z",
    tags: ["lost", "husky", "urgent"],
    featured: true,
    views: 2450,
    pet: {
      id: "pet1",
      name: "Max",
      type: "Husky",
      breed: "Siberian Husky",
      age: 36,
      gender: "male",
      color: "Trắng xám",
      size: "large",
      weight: 28,
      personality: ["hiếu kỳ", "năng động", "thân thiện", "thông minh"],
      specialNeeds: "Không có",
      bio: "Max là một chú Husky 3 tuổi, rất thích chơi đùa và hoạt động ngoài trời. Anh ấy rất thân thiện với mọi người.",
      healthRecord: {
        id: "health1",
        vaccinations: [
          { name: "Rabies", date: "2024-09-15", nextDue: "2025-09-15" },
          { name: "DHPP", date: "2024-09-15", nextDue: "2025-09-15" },
          { name: "Bordetella", date: "2024-08-20", nextDue: "2025-08-20" }
        ],
        medicalHistory: [
          { date: "2024-09-15", condition: "Khám sức khỏe thường niên", treatment: "Kiểm tra toàn thân, Tiêm vaccine", notes: "Tình trạng tốt, không có vấn đề gì" },
          { date: "2024-07-10", condition: "Viêm tai nhẹ", treatment: "Thuốc nhỏ tai", notes: "Hết ngay sau 1 tuần" }
        ],
        weight: [
          { date: "2024-09-15", value: 28 },
          { date: "2024-07-10", value: 27.5 }
        ],
        lastCheckup: "2024-09-15",
        allergies: ["Thịt gà"],
        notes: "Cần tập thể dục thường xuyên, thích chơi ở công viên"
      },
      photos: [
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop"
      ]
    }
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
    locationCoords: {
      latitude: 10.8256,
      longitude: 106.7331
    },
    postedBy: {
      id: "user2",
      name: "Trần Thị B",
      phone: "0987654321",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=100&auto=format&fit=crop"
    },
    createdAt: "2024-11-03T14:20:00Z",
    tags: ["adoption", "golden-retriever", "healthy"],
    featured: true,
    views: 1890,
    pet: {
      id: "pet2",
      name: "Buddy",
      type: "Golden Retriever",
      breed: "Golden Retriever",
      age: 2,
      gender: "male",
      color: "Vàng nâu",
      size: "medium",
      weight: 3.5,
      personality: ["vui vẻ", "thân thiện", "yêu thương", "học hỏi nhanh"],
      specialNeeds: "Không có",
      bio: "Buddy là một chú chó con Golden Retriever sinh năm 2024, rất hoạt bát, thích chơi đùa với con người.",
      healthRecord: {
        id: "health2",
        vaccinations: [
          { name: "Đầu tiên", date: "2024-08-10", nextDue: "2024-11-10" },
          { name: "Thứ hai", date: "2024-09-20", nextDue: "2024-12-20" }
        ],
        medicalHistory: [
          { date: "2024-08-10", condition: "Khám sức khỏe ban đầu", treatment: "Tiêm vaccine lần 1", notes: "Khỏe mạnh, không có vấn đề gì" }
        ],
        weight: [
          { date: "2024-11-01", value: 3.5 }
        ],
        lastCheckup: "2024-09-20",
        allergies: [],
        notes: "Bé rất khỏe, cần tiếp tục tiêm vaccine đầy đủ theo lịch"
      },
      photos: [
        "https://images.unsplash.com/photo-1633566137282-a8c8c0c1c2f0?q=80&w=800&auto=format&fit=crop"
      ]
    }
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
    views: 1340,
    pet: {
      id: "pet3",
      name: "Luna",
      type: "Mèo hoang",
      breed: "Mèo hoang",
      age: 24,
      gender: "female",
      color: "Cam trắng",
      size: "small",
      weight: 3.2,
      personality: ["nhạy cảm", "cần yêu thương", "từng chút một tin tưởng"],
      specialNeeds: "Cần thời gian để thích nghi, tránh tiếng ồn",
      bio: "Luna là một mèo hoang được đội cứu hộ tìm thấy, đã được chữa trị và đang tìm gia đình yêu thương.",
      healthRecord: {
        id: "health3",
        vaccinations: [
          { name: "Rabies", date: "2024-10-15", nextDue: "2025-10-15" },
          { name: "FVRCP", date: "2024-10-15", nextDue: "2025-10-15" }
        ],
        medicalHistory: [
          { date: "2024-10-15", condition: "Vết thương tại chân trái", treatment: "Khâu vết thương, thuốc kháng sinh", notes: "Đã lành tốt" },
          { date: "2024-10-15", condition: "Kiểm tra sức khỏe toàn thân", treatment: "Khám, vaccine, tẩy giun", notes: "Tình trạng ổn định" }
        ],
        weight: [
          { date: "2024-10-15", value: 3.2 }
        ],
        lastCheckup: "2024-10-15",
        allergies: [],
        notes: "Đã được khử trùng, cần kiểm tra vết thương hàng tuần trong tháng đầu"
      },
      photos: [
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop"
      ]
    }
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
    views: 890,
    pet: {
      id: "pet4",
      name: "Tina",
      type: "Poodle",
      breed: "Poodle tiêu chuẩn",
      age: 48,
      gender: "female",
      color: "Trắng",
      size: "medium",
      weight: 7.5,
      personality: ["thông minh", "vui vẻ", "yêu cầu chú ý"],
      specialNeeds: "Cần tắm rửa và cắt lông thường xuyên",
      bio: "Tina là một mèo Poodle trắng được tìm thấy tại công viên, có vẻ bị chủ bỏ rơi.",
      healthRecord: {
        id: "health4",
        vaccinations: [
          { name: "Rabies", date: "2024-08-01", nextDue: "2025-08-01" },
          { name: "DHPP", date: "2024-08-01", nextDue: "2025-08-01" }
        ],
        medicalHistory: [
          { date: "2024-11-02", condition: "Khám sức khỏe", treatment: "Kiểm tra toàn thân", notes: "Tình trạng tốt, có dấu hiệu bỏ bê" }
        ],
        weight: [
          { date: "2024-11-02", value: 7.5 }
        ],
        lastCheckup: "2024-11-02",
        allergies: [],
        notes: "Cần tắm rửa và cắt lông gấp ngay"
      },
      photos: [
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800&auto=format&fit=crop"
      ],
      qrCodeUrl: "http://localhost:8080/api/pets/pet4/qr-code"
    }
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
    views: 450,
    pet: {
      id: "pet5",
      name: "Miu",
      type: "Mèo Ba Tư",
      breed: "Mèo Ba Tư",
      age: 6,
      gender: "female",
      color: "Đen",
      size: "small",
      weight: 2.8,
      personality: ["dễ thương", "hiền lành", "yêu thương", "thích ngủ"],
      specialNeeds: "Không có",
      bio: "Miu là một chú mèo Ba Tư đen vô cùng dễ thương, 6 tháng tuổi, vừa được khử trùng và tiêm vaccine đầy đủ.",
      healthRecord: {
        id: "health5",
        vaccinations: [
          { name: "FVRCP", date: "2024-10-01", nextDue: "2025-04-01" },
          { name: "Rabies", date: "2024-10-01", nextDue: "2025-10-01" }
        ],
        medicalHistory: [
          { date: "2024-10-01", condition: "Khám sức khỏe và khử trùng", treatment: "Khám, vaccine, khử trùng", notes: "Tình trạng rất tốt" }
        ],
        weight: [
          { date: "2024-10-01", value: 2.8 }
        ],
        lastCheckup: "2024-10-01",
        allergies: [],
        notes: "Mèo rất khỏe, thích đồ chơi và bạn bè"
      },
      photos: [
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop"
      ],
      qrCodeUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX///8AAAB4eHgnJye7u7vo6OiioqJwcHDy8vLBwcFnZ2evr6/i4uKHh4dVVVWcnJy1tbU1NTXS0tKVlZWpqamOjo7Y2Nh/f3/Hx8dMTEzx8fH4+Phra2sbGxtHR0fg4OA8PDwREREwMDBcXFwiIiIYGBgxMTFBQUH/lneRAAAKh0lEQVR4nO2df0OyMBDH0xBFU0nwJ6SWVu//HT7ujie/eAyHYFrd9y8a27GP6ca22+3hQaVSqVQqlUqlUqlUKpVKpVKpVCpVpn9lFgUCI6E3/AAAAABJRU5ErkJggg=="
    }
  }
]
