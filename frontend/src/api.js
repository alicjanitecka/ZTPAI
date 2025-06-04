import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (refreshToken) {
                try {
                    const res = await axios.post(
                        "/api/token/refresh/",
                        { refresh: refreshToken },
                        { baseURL: api.defaults.baseURL }
                    );
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem(ACCESS_TOKEN);
                    localStorage.removeItem(REFRESH_TOKEN);
                    window.location.href = "/login?expired=1";
                    return Promise.reject(refreshError);
                }
            } else {
                window.location.href = "/login?expired=1";
            }
        }
        return Promise.reject(error);
    }
);

export default api