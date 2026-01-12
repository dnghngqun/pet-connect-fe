import axios from 'axios';
import { BASE_URL, COMMON_API } from '@/common/Constant/COMMON_API';
import { toast } from 'react-hot-toast';

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

// Interceptor for handling response and toasts
apiClient.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        // Show success toast for mutations
        if (['post', 'put', 'patch', 'delete'].includes(method || '')) {
            const message = response.data?.message || 'Operation successful';
            toast.success(message);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 separately (refresh token logic)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // ... existing 401 logic ...
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
                 toast.error('Session expired. Please login again.');
                 return Promise.reject(refreshError);
             } finally {
                 isRefreshing = false;
             }
        }
        
        // Show error toast for other errors
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        // Avoid showing toast for 401s that are being handled by refresh logic unless distinct
        if (error.response?.status !== 401) {
            toast.error(message);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;


