// API 基础配置
const API_BASE_URL = 'http://localhost:8000';

// API 请求封装
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || '请求失败');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// 客户 API
const CustomerAPI = {
    getAll: () => apiRequest('/customers'),

    getById: (id) => apiRequest(`/customers/${id}`),

    create: (data) => apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => apiRequest(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => apiRequest(`/customers/${id}`, {
        method: 'DELETE',
    }),
};

// 预约 API
const AppointmentAPI = {
    getAll: () => apiRequest('/appointments'),

    getById: (id) => apiRequest(`/appointments/${id}`),

    getByCustomer: (customerId) => apiRequest(`/appointments/customer/${customerId}`),

    create: (data) => apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => apiRequest(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => apiRequest(`/appointments/${id}`, {
        method: 'DELETE',
    }),
};

// 导出 API 对象
window.API = { Customer: CustomerAPI, Appointment: AppointmentAPI };
