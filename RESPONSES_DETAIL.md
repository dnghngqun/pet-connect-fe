## 📋 CHI TIẾT CÁC RESPONSE - PETCONNECT

---

# 0️⃣ RESPONSE ĐĂNG NHẬP

## Endpoint: POST /api/auth/login

### Request Body:
```json
{
  "email": "admin@petconnect.vn",
  "password": "Password123!"
}
```

### Response Code: 200 OK

```json
{
  "code": "0000",
  "message": "Thành công",
  "data": {
    "id": 1,
    "email": "admin@petconnect.vn",
    "fullName": "System Administrator",
    "avatarUrl": null,
    "roleCode": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBwZXRjb25uZWN0LnZuIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzYzNzI2MTYyLCJleHAiOjE3NjM3Mjk3NjJ9.7aW8vNorT-6oKqkii6R8URMipQAwoeA-706Fg2ik-1o"
  }
}
```

**Lưu ý:** Dữ liệu user sẽ được lưu vào `localStorage` với key `pet-connect-user`. Nếu `avatarUrl` là `null`, hệ thống sẽ tự động gán một avatar mặc định từ danh sách DiceBear Avatars.

---

# 0️⃣ RESPONSE ĐĂNG KÝ

## Endpoint: POST /api/auth/register

### Request Body:
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "email": "a@example.com",
  "password": "Password123!"
}
```

### Response Code: 201 Created

```json
{
  "code": "0000",
  "message": "Đăng ký thành công",
  "data": {
    "id": 2,
    "email": "a@example.com",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": null,
    "roleCode": "USER",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjM3MjYxNjIsImV4cCI6MTc2MzcyOTc2Mn0.newTokenHere"
  }
}
```

### Response Code: 400 Bad Request (Email Already Exists)

```json
{
  "code": "4000",
  "message": "Email đã tồn tại trong hệ thống",
  "data": null
}
```

---

# 1️⃣ RESPONSE DANH SÁCH BÀI ĐĂNG

## Endpoint: GET /api/posts?page=1&limit=10&status=LOST&city=TP.HCM

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Danh sách bài đăng đã được lấy thành công",
  "data": {
    "posts": [
      {
        "id": "post-001",
        "title": "Chó Husky mất tích tại quận 1, TP.HCM",
        "slug": "cho-husky-mat-tich-quan-1",
        "petType": "Husky",
        "status": "LOST",
        "location": "Quận 1, TP.HCM",
        "city": "TP. Hồ Chí Minh",
        "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
        "description": "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh. Mất tích vào ngày 3/11 tại khu vực Nguyễn Hữu Cảnh. Nếu ai nhìn thấy vui lòng liên hệ ngay.",
        "views": 2450,
        "featured": true,
        "tags": ["lost", "husky", "urgent"],
        "postedBy": {
          "id": "user-001",
          "name": "Nguyễn Văn A",
          "phone": "0912345678",
          "avatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100"
        },
        "createdAt": "2024-11-04T10:30:00Z",
        "updatedAt": "2024-11-04T10:30:00Z"
      },
      {
        "id": "post-002",
        "title": "Mèo mèo hoang bị thương được cứu hộ",
        "slug": "meo-hoang-bi-thuong",
        "petType": "Mèo",
        "status": "RESCUE",
        "location": "Quận 2, TP.HCM",
        "city": "TP. Hồ Chí Minh",
        "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
        "description": "Mèo hoang bị xe cộ cán được đội cứu hộ PetAid cứu hộ. Đã được chữa trị, tiêm vaccine. Tìm gia đình để nuôi.",
        "views": 1340,
        "featured": false,
        "tags": ["rescue", "cat", "need-support"],
        "postedBy": {
          "id": "org-001",
          "name": "Trạm Cứu Hộ PetAid",
          "phone": "0868888888",
          "avatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100"
        },
        "createdAt": "2024-11-02T09:15:00Z",
        "updatedAt": "2024-11-02T09:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "status": ["LOST", "FOUND", "FOR_ADOPTION", "RESCUE"],
      "city": "TP. Hồ Chí Minh",
      "petType": "all"
    }
  }
}
```

---

# 2️⃣ RESPONSE CHI TIẾT BÀI ĐĂNG

## Endpoint: GET /api/posts/cho-husky-mat-tich-quan-1

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chi tiết bài đăng đã được lấy thành công",
  "data": {
    "post": {
      "id": "post-001",
      "title": "Chó Husky mất tích tại quận 1, TP.HCM",
      "slug": "cho-husky-mat-tich-quan-1",
      "petType": "Husky",
      "status": "LOST",
      "location": "Quận 1, TP.HCM",
      "city": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "latitude": 10.7769,
      "longitude": 106.7009,
      "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
      "description": "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh, mất tích vào ngày 3/11 tại khu vực Nguyễn Hữu Cảnh. Nếu ai nhìn thấy vui lòng liên hệ ngay. Cảm ơn!",
      "views": 2451,
      "featured": true,
      "tags": ["lost", "husky", "urgent"],
      "isActive": true,
      "postedBy": {
        "id": "user-001",
        "name": "Nguyễn Văn A",
        "email": "a@example.com",
        "phone": "0912345678",
        "avatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "bio": "Yêu thích các thú cưng",
        "rating": 4.8,
        "postCount": 5,
        "responseTime": "< 2 giờ"
      },
      "pet": {
        "id": "pet-001",
        "name": "Max",
        "type": "Chó",
        "breed": "Siberian Husky",
        "age": 36,
        "gender": "MALE",
        "color": "Trắng xám",
        "size": "LARGE",
        "weight": 28.5,
        "personality": [
          "hiếu kỳ",
          "năng động",
          "thân thiện",
          "thông minh"
        ],
        "specialNeeds": "Không có",
        "bio": "Max là một chú Husky 3 tuổi, rất thích chơi đùa và hoạt động ngoài trời. Anh ấy rất thân thiện với mọi người.",
        "photos": [
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500"
        ],
        "healthRecord": {
          "id": "health-001",
          "lastCheckup": "2024-09-15T10:00:00Z",
          "weight": 28.5,
          "allergies": ["Thịt gà"],
          "vaccinations": [
            {
              "id": "vac-001",
              "name": "Rabies",
              "vaccinationDate": "2024-09-15T14:30:00Z",
              "nextDueDate": "2025-09-15T14:30:00Z",
              "veterinarian": "Bác sĩ Nguyễn",
              "clinic": "Phòng khám thú y An Phú"
            },
            {
              "id": "vac-002",
              "name": "DHPP",
              "vaccinationDate": "2024-09-15T14:30:00Z",
              "nextDueDate": "2025-09-15T14:30:00Z",
              "veterinarian": "Bác sĩ Nguyễn",
              "clinic": "Phòng khám thú y An Phú"
            }
          ],
          "medicalHistory": [
            {
              "id": "med-001",
              "visitDate": "2024-09-15T10:00:00Z",
              "condition": "Khám sức khỏe thường niên",
              "treatment": "Kiểm tra toàn thân, Tiêm vaccine",
              "notes": "Tình trạng tốt, không có vấn đề gì",
              "cost": 500000
            }
          ]
        }
      },
      "comments": {
        "total": 5,
        "items": [
          {
            "id": "comment-001",
            "userId": "user-002",
            "userName": "Trần Thị B",
            "userAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
            "content": "Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!",
            "likes": 5,
            "createdAt": "2024-11-04T11:00:00Z",
            "replies": [
              {
                "id": "comment-002",
                "userId": "user-001",
                "userName": "Nguyễn Văn A",
                "userAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
                "content": "Cảm ơn bạn! Bạn có thể liên hệ với tôi không?",
                "createdAt": "2024-11-04T11:30:00Z"
              }
            ]
          }
        ]
      },
      "relatedPosts": [
        {
          "id": "post-003",
          "title": "Chó Poodle trắng tìm thấy tại công viên Tao Đàn",
          "slug": "cho-poodle-tim-thay",
          "image": "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500",
          "status": "FOUND",
          "views": 890
        }
      ],
      "createdAt": "2024-11-04T10:30:00Z",
      "updatedAt": "2024-11-04T10:30:00Z"
    }
  }
}
```

---

# 3️⃣ RESPONSE HỒ SƠ Y TẾ

## Endpoint: GET /api/pets/pet-001/health-records

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hồ sơ y tế đã được lấy thành công",
  "data": {
    "healthRecord": {
      "id": "health-001",
      "petId": "pet-001",
      "petName": "Max",
      "petType": "Husky",
      "lastCheckup": "2024-09-15T10:00:00Z",
      "weight": 28.5,
      "notes": "Cần tập thể dục thường xuyên, thích chơi ở công viên",
      "allergies": [
        "Thịt gà"
      ],
      "vaccinations": [
        {
          "id": "vac-001",
          "name": "Rabies",
          "vaccinationDate": "2024-09-15T14:30:00Z",
          "nextDueDate": "2025-09-15T14:30:00Z",
          "veterinarian": "Bác sĩ Nguyễn",
          "clinic": "Phòng khám thú y An Phú",
          "notes": "Tiêm vào cơ bắp đùi trái",
          "status": "COMPLETED"
        },
        {
          "id": "vac-002",
          "name": "DHPP",
          "vaccinationDate": "2024-09-15T14:30:00Z",
          "nextDueDate": "2025-09-15T14:30:00Z",
          "veterinarian": "Bác sĩ Nguyễn",
          "clinic": "Phòng khám thú y An Phú",
          "notes": "Tiêm vào cơ bắp đùi phải",
          "status": "COMPLETED"
        },
        {
          "id": "vac-003",
          "name": "Bordetella",
          "vaccinationDate": "2024-08-20T10:00:00Z",
          "nextDueDate": "2025-08-20T10:00:00Z",
          "veterinarian": "Bác sĩ Trần Minh",
          "clinic": "Petcare Clinic",
          "notes": "Tiêm phòng bệnh ho",
          "status": "COMPLETED"
        }
      ],
      "medicalHistory": [
        {
          "id": "med-001",
          "visitDate": "2024-09-15T10:00:00Z",
          "condition": "Khám sức khỏe thường niên",
          "treatment": "Kiểm tra toàn thân, Tiêm vaccine",
          "veterinarian": "Bác sĩ Trần Minh",
          "clinic": "Phòng khám thú y Petcare",
          "notes": "Tình trạng tốt, không có vấn đề gì",
          "cost": 500000
        },
        {
          "id": "med-002",
          "visitDate": "2024-07-10T14:00:00Z",
          "condition": "Viêm tai nhẹ",
          "treatment": "Thuốc nhỏ tai",
          "veterinarian": "Bác sĩ Nguyễn",
          "clinic": "Phòng khám thú y An Phú",
          "notes": "Hết ngay sau 1 tuần",
          "cost": 250000
        }
      ],
      "weightTracking": [
        {
          "id": "weight-001",
          "weight": 28.5,
          "recordDate": "2024-09-15T10:00:00Z",
          "notes": "Cân nặng ổn định"
        },
        {
          "id": "weight-002",
          "weight": 27.5,
          "recordDate": "2024-07-10T10:00:00Z",
          "notes": "Tăng cân đều đặn"
        }
      ],
      "upcomingSchedule": [
        {
          "type": "VACCINATION",
          "name": "Rabies",
          "dueDate": "2025-09-15",
          "daysUntilDue": 71,
          "status": "UPCOMING",
          "priority": "HIGH"
        },
        {
          "type": "CHECKUP",
          "description": "Khám sức khỏe định kỳ",
          "dueDate": "2024-12-15",
          "daysUntilDue": 8,
          "status": "URGENT",
          "priority": "HIGH"
        }
      ],
      "healthStatus": {
        "overall": "GOOD",
        "vaccinated": true,
        "dewormed": true,
        "neutered": false,
        "microchipped": true
      },
      "createdAt": "2024-09-15T10:00:00Z",
      "updatedAt": "2024-11-01T14:00:00Z"
    }
  }
}
```

---

# 4️⃣ RESPONSE THÔNG TIN CHI TIẾT THÚ CƯNG

## Endpoint: GET /api/pets/pet-001

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thông tin thú cưng đã được lấy thành công",
  "data": {
    "pet": {
      "id": "pet-001",
      "userId": "user-001",
      "name": "Max",
      "type": "Chó",
      "breed": "Siberian Husky",
      "age": 36,
      "gender": "MALE",
      "color": "Trắng xám",
      "size": "LARGE",
      "weight": 28.5,
      "personality": [
        "hiếu kỳ",
        "năng động",
        "thân thiện",
        "thông minh"
      ],
      "specialNeeds": "Không có",
      "bio": "Max là một chú Husky 3 tuổi, rất thích chơi đùa và hoạt động ngoài trời. Anh ấy rất thân thiện với mọi người.",
      "profilePhoto": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
      "photos": [
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500"
      ],
      "owner": {
        "id": "user-001",
        "name": "Nguyễn Văn A",
        "avatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "phone": "0912345678"
      },
      "healthRecord": {
        "id": "health-001",
        "lastCheckup": "2024-09-15T10:00:00Z",
        "weight": 28.5,
        "allergies": [
          "Thịt gà"
        ],
        "vaccinations": [
          {
            "name": "Rabies",
            "vaccinationDate": "2024-09-15",
            "nextDueDate": "2025-09-15",
            "status": "COMPLETED"
          },
          {
            "name": "DHPP",
            "vaccinationDate": "2024-09-15",
            "nextDueDate": "2025-09-15",
            "status": "COMPLETED"
          }
        ]
      },
      "posts": [
        {
          "id": "post-001",
          "title": "Chó Husky mất tích tại quận 1, TP.HCM",
          "status": "LOST",
          "createdAt": "2024-11-04T10:30:00Z"
        }
      ],
      "stats": {
        "totalPosts": 1,
        "views": 2451,
        "comments": 5
      },
      "createdAt": "2024-10-01T10:00:00Z",
      "updatedAt": "2024-11-01T14:00:00Z"
    }
  }
}
```

---

# 5️⃣ RESPONSE TẠO BÀI ĐĂNG

## Endpoint: POST /api/posts
## Headers: Authorization: Bearer {token}

### Request Body:
```json
{
  "title": "Chó Husky mất tích tại quận 1, TP.HCM",
  "description": "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh, mất tích vào ngày 3/11...",
  "petType": "Husky",
  "status": "LOST",
  "location": "Quận 1, TP.HCM",
  "city": "TP. Hồ Chí Minh",
  "district": "Quận 1",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
  "tags": ["lost", "husky", "urgent"],
  "petId": "pet-001"
}
```

### Response Code: 201 Created

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Bài đăng đã được tạo thành công",
  "data": {
    "post": {
      "id": "post-001",
      "title": "Chó Husky mất tích tại quận 1, TP.HCM",
      "slug": "cho-husky-mat-tich-quan-1",
      "description": "Con chó Husky bốc lông trắng xám, mắc vòng cổ xanh, mất tích vào ngày 3/11...",
      "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
      "petType": "Husky",
      "status": "LOST",
      "location": "Quận 1, TP.HCM",
      "city": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "latitude": 10.7769,
      "longitude": 106.7009,
      "tags": ["lost", "husky", "urgent"],
      "views": 0,
      "featured": false,
      "isActive": true,
      "createdAt": "2024-11-07T10:00:00Z",
      "updatedAt": "2024-11-07T10:00:00Z"
    }
  }
}
```

---

# 6️⃣ RESPONSE CẬP NHẬT HỒ SƠ Y TẾ

## Endpoint: PUT /api/pets/pet-001/health-records
## Headers: Authorization: Bearer {token}

### Request Body:
```json
{
  "weight": 28.5,
  "lastCheckup": "2024-11-07T10:00:00Z",
  "notes": "Tình trạng sức khỏe tốt, không có vấn đề gì",
  "allergies": ["Thịt gà"],
  "newVaccination": {
    "name": "Rabies Booster",
    "vaccinationDate": "2024-11-07",
    "nextDueDate": "2025-11-07",
    "veterinarian": "Bác sĩ Nguyễn",
    "clinic": "Phòng khám thú y An Phú",
    "notes": "Tiêm nhắc lại Rabies"
  },
  "newMedicalRecord": {
    "visitDate": "2024-11-07",
    "condition": "Khám sức khỏe định kỳ",
    "treatment": "Kiểm tra toàn thân",
    "veterinarian": "Bác sĩ Trần Minh",
    "clinic": "Phòng khám thú y Petcare",
    "notes": "Tình trạng tốt, không có vấn đề gì",
    "cost": 500000
  }
}
```

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hồ sơ y tế đã được cập nhật thành công",
  "data": {
    "healthRecord": {
      "id": "health-001",
      "petId": "pet-001",
      "lastCheckup": "2024-11-07T10:00:00Z",
      "weight": 28.5,
      "notes": "Tình trạng sức khỏe tốt, không có vấn đề gì",
      "allergies": ["Thịt gà"],
      "vaccinations": [
        {
          "id": "vac-001",
          "name": "Rabies",
          "vaccinationDate": "2024-09-15",
          "nextDueDate": "2025-09-15",
          "status": "COMPLETED"
        },
        {
          "id": "vac-004",
          "name": "Rabies Booster",
          "vaccinationDate": "2024-11-07",
          "nextDueDate": "2025-11-07",
          "veterinarian": "Bác sĩ Nguyễn",
          "clinic": "Phòng khám thú y An Phú",
          "status": "COMPLETED"
        }
      ],
      "medicalHistory": [
        {
          "id": "med-003",
          "visitDate": "2024-11-07T10:00:00Z",
          "condition": "Khám sức khỏe định kỳ",
          "treatment": "Kiểm tra toàn thân",
          "veterinarian": "Bác sĩ Trần Minh",
          "clinic": "Phòng khám thú y Petcare",
          "notes": "Tình trạng tốt, không có vấn đề gì",
          "cost": 500000
        }
      ],
      "updatedAt": "2024-11-07T10:00:00Z"
    }
  }
}
```

---

# 7️⃣ RESPONSE DANH SÁCH BÌNH LUẬN

## Endpoint: GET /api/posts/post-001/comments?page=1&limit=10

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Danh sách bình luận đã được lấy thành công",
  "data": {
    "comments": {
      "total": 5,
      "items": [
        {
          "id": "comment-001",
          "postId": "post-001",
          "userId": "user-002",
          "userName": "Trần Thị B",
          "userAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
          "content": "Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!",
          "likes": 5,
          "isActive": true,
          "replies": [
            {
              "id": "comment-002",
              "userId": "user-001",
              "userName": "Nguyễn Văn A",
              "userAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
              "content": "Cảm ơn bạn! Bạn có thể liên hệ với tôi không?",
              "likes": 1,
              "createdAt": "2024-11-04T11:30:00Z"
            }
          ],
          "createdAt": "2024-11-04T11:00:00Z",
          "updatedAt": "2024-11-04T11:00:00Z"
        }
      ]
    },
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

# 8️⃣ RESPONSE TẠO BÌNH LUẬN

## Endpoint: POST /api/posts/post-001/comments
## Headers: Authorization: Bearer {token}

### Request Body:
```json
{
  "content": "Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!",
  "parentCommentId": null
}
```

### Response Code: 201 Created

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Bình luận đã được tạo thành công",
  "data": {
    "comment": {
      "id": "comment-001",
      "postId": "post-001",
      "userId": "user-002",
      "userName": "Trần Thị B",
      "userAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
      "content": "Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!",
      "likes": 0,
      "parentCommentId": null,
      "isActive": true,
      "createdAt": "2024-11-04T11:00:00Z"
    }
  }
}
```

---

# 9️⃣ RESPONSE THÔNG BÁO

## Endpoint: GET /api/notifications?page=1&limit=20
## Headers: Authorization: Bearer {token}

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Danh sách thông báo đã được lấy thành công",
  "data": {
    "notifications": [
      {
        "id": "notif-001",
        "userId": "user-001",
        "fromUserId": "user-002",
        "fromUserName": "Trần Thị B",
        "fromUserAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "postId": "post-001",
        "type": "COMMENT",
        "title": "Có bình luận mới trên bài đăng của bạn",
        "content": "Trần Thị B đã bình luận: 'Tôi thấy chú chó này ở công viên Tao Đàn hôm qua!'",
        "link": "/pet/cho-husky-mat-tich-quan-1",
        "isRead": false,
        "createdAt": "2024-11-04T11:00:00Z"
      },
      {
        "id": "notif-002",
        "userId": "user-001",
        "fromUserId": "user-003",
        "fromUserName": "Phạm Minh C",
        "fromUserAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "postId": "post-001",
        "type": "MESSAGE",
        "title": "Tin nhắn mới từ Phạm Minh C",
        "content": "Phạm Minh C: 'Tôi có thông tin về chú chó của bạn...'",
        "link": "/messages/user-003",
        "isRead": false,
        "createdAt": "2024-11-04T12:00:00Z"
      }
    ],
    "unreadCount": 2,
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 2,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

# 🔟 RESPONSE TIN NHẮN

## Endpoint: GET /api/messages/user-002?page=1&limit=20
## Headers: Authorization: Bearer {token}

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Danh sách tin nhắn đã được lấy thành công",
  "data": {
    "messages": [
      {
        "id": "msg-001",
        "senderId": "user-002",
        "senderName": "Trần Thị B",
        "senderAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "receiverId": "user-001",
        "postId": "post-001",
        "content": "Chào bạn, tôi có thông tin về chú Husky của bạn",
        "isRead": false,
        "createdAt": "2024-11-04T11:05:00Z"
      },
      {
        "id": "msg-002",
        "senderId": "user-001",
        "senderName": "Nguyễn Văn A",
        "senderAvatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
        "receiverId": "user-002",
        "postId": "post-001",
        "content": "Cảm ơn bạn! Bạn có thể cho tôi thêm thông tin được không?",
        "isRead": true,
        "createdAt": "2024-11-04T11:10:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 2,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

# 1️⃣1️⃣ RESPONSE NGƯỜI DÙNG

## Endpoint: GET /api/users/user-001

### Response Code: 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thông tin người dùng đã được lấy thành công",
  "data": {
    "user": {
      "id": "user-001",
      "username": "nguyen_van_a",
      "email": "a@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "avatar": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
      "bio": "Yêu thích các thú cưng",
      "address": "123 Đường Lê Lợi",
      "city": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "role": "USER",
      "isVerified": true,
      "isActive": true,
      "stats": {
        "postsCount": 5,
        "petsCount": 2,
        "rating": 4.8,
        "followers": 120,
        "following": 45
      },
      "pets": [
        {
          "id": "pet-001",
          "name": "Max",
          "type": "Chó",
          "breed": "Husky",
          "profilePhoto": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100"
        },
        {
          "id": "pet-002",
          "name": "Luna",
          "type": "Mèo",
          "breed": "Mèo Ba Tư",
          "profilePhoto": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100"
        }
      ],
      "createdAt": "2024-10-01T10:00:00Z",
      "lastLogin": "2024-11-07T14:00:00Z"
    }
  }
}
```

---

# 🔴 ERROR RESPONSES

## 1. Validation Error (400 Bad Request)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Yêu cầu không hợp lệ",
  "errors": [
    {
      "field": "title",
      "message": "Tiêu đề phải có độ dài từ 5-200 ký tự"
    },
    {
      "field": "description",
      "message": "Mô tả phải có độ dài tối thiểu 10 ký tự"
    }
  ]
}
```

## 2. Unauthorized Error (401)

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Bạn cần đăng nhập để thực hiện hành động này",
  "errors": [
    {
      "field": "auth",
      "message": "Token không hợp lệ hoặc đã hết hạn"
    }
  ]
}
```

## 3. Forbidden Error (403)

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "errors": [
    {
      "field": "permission",
      "message": "Chỉ chủ sở hữu mới có thể cập nhật bài đăng này"
    }
  ]
}
```

## 4. Not Found Error (404)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Không tìm thấy tài nguyên",
  "errors": [
    {
      "field": "slug",
      "message": "Bài đăng không tồn tại"
    }
  ]
}
```

## 5. Conflict Error (409)

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Xung đột",
  "errors": [
    {
      "field": "email",
      "message": "Email đã được sử dụng"
    }
  ]
}
```

## 6. Server Error (500)

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Lỗi máy chủ nội bộ",
  "errors": []
}
```

---

**Cập nhật:** November 7, 2025
**Phiên bản:** 1.0.0
