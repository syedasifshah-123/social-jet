import axios from "axios";

const API_BASE_URL = "http://localhost:5510/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});



// 1. REQUEST INTERCEPTOR: Har request se pehle token lagayega
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



// 2. RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });

                const { accessToken } = res.data;
                localStorage.setItem("accessToken", accessToken);

                // SET NEW TOKEN
                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
