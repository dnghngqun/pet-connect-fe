import axios from 'axios';
import { BASE_URL, COMMON_API } from '@/common/Constant/COMMON_API';

const STORAGE_KEY = 'pet-connect-user';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Interceptor thêm token vào mọi request
apiClient.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem(STORAGE_KEY);
        const token = user ? JSON.parse(user).token : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi response với auto refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Nếu 401 và chưa thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if user is logged in first
            const userStr = localStorage.getItem(STORAGE_KEY);
            
            // If no user data, don't attempt refresh - just redirect to login
            if (!userStr) {
                if (!window.location.pathname.includes('/sign-in') && 
                    !window.location.pathname.includes('/sign-up')) {
                    window.location.href = '/sign-in';
                }
                return Promise.reject(error);
            }
            
            // Nếu đang refresh, queue request này lại
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const user = JSON.parse(userStr);
                const refreshToken = user?.refreshToken;
                
                if (!refreshToken) throw new Error('No refresh token');

                // Gọi API refresh token
                const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
                    refreshToken
                });

                // Get tokens from ResponseDTO structure
                const { data } = response.data;
                const newAccessToken = data.accessToken || data.token;
                const newRefreshToken = data.refreshToken;
                
                // Cập nhật localStorage
                user.token = newAccessToken;
                if (newRefreshToken) {
                    user.refreshToken = newRefreshToken;
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

                // Process các request đang chờ
                processQueue(null, newAccessToken);

                // Retry request ban đầu
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh thất bại -> logout
                localStorage.removeItem(STORAGE_KEY);
                if (!window.location.pathname.includes('/sign-in')) {
                    window.location.href = '/sign-in';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;


