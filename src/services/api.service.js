import api from '../config/api';

// ==================== Authentication ====================
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updatePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/update-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }
};

// ==================== Employees ====================
export const employeeService = {
    getAll: async (params = {}) => {
        const response = await api.get('/employees', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    },

    create: async (employeeData) => {
        const response = await api.post('/employees', employeeData);
        return response.data;
    },

    update: async (id, employeeData) => {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/employees/stats/overview');
        return response.data;
    }
};

// ==================== Projects ====================
export const projectService = {
    getAll: async (params = {}) => {
        const response = await api.get('/projects', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (projectData) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    },

    update: async (id, projectData) => {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/projects/stats/overview');
        return response.data;
    }
};

// ==================== Assets ====================
export const assetService = {
    getAll: async (params = {}) => {
        const response = await api.get('/assets', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/assets/${id}`);
        return response.data;
    },

    create: async (assetData) => {
        const response = await api.post('/assets', assetData);
        return response.data;
    },

    update: async (id, assetData) => {
        const response = await api.put(`/assets/${id}`, assetData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/assets/stats/overview');
        return response.data;
    }
};

// ==================== Subscriptions ====================
export const subscriptionService = {
    getAll: async (params = {}) => {
        const response = await api.get('/subscriptions', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/subscriptions/${id}`);
        return response.data;
    },

    create: async (subscriptionData) => {
        const response = await api.post('/subscriptions', subscriptionData);
        return response.data;
    },

    update: async (id, subscriptionData) => {
        const response = await api.put(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/subscriptions/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/subscriptions/stats/overview');
        return response.data;
    }
};
