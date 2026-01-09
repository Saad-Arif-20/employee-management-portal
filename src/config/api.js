import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if this is a password update error (don't logout)
            const isPasswordUpdateError = error.config?.url?.includes('/auth/update-password');
            const errorMessage = error.response?.data?.message || '';
            const isWrongPasswordError = errorMessage.toLowerCase().includes('current password');

            // Only logout if it's an actual token/auth issue, not a wrong password
            if (!isPasswordUpdateError && !isWrongPasswordError) {
                // Token expired or invalid - logout user
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
