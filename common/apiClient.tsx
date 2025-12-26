import axios from 'axios';
import { BASE_URL, COMMON_API } from '@/common/Constant/COMMON_API';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor thêm token vào mọi request
apiClient.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('pet-connect-user');
        const token = user ? JSON.parse(user).token : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi response (ví dụ: token hết hạn)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token hết hạn hoặc không hợp lệ -> logout
            localStorage.removeItem('user');
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
