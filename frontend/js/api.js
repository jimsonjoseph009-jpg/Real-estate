// API Configuration and utilities
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization token if available
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// User API Calls
const userAPI = {
    register: (userData) => apiCall('/users/register', {
        method: 'POST',
        body: userData
    }),
    login: (credentials) => apiCall('/users/login', {
        method: 'POST',
        body: credentials
    }),
    getProfile: () => apiCall('/users/profile'),
    updateProfile: (data) => apiCall('/users/profile', {
        method: 'PUT',
        body: data
    }),
    getAgents: () => apiCall('/users/agents')
};

// Property API Calls
const propertyAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/properties?${queryString}`);
    },
    getById: (propertyId) => apiCall(`/properties/${propertyId}`),
    create: (data) => apiCall('/properties', {
        method: 'POST',
        body: data
    }),
    update: (propertyId, data) => apiCall(`/properties/${propertyId}`, {
        method: 'PUT',
        body: data
    }),
    delete: (propertyId) => apiCall(`/properties/${propertyId}`, {
        method: 'DELETE'
    }),
    search: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/properties/search?${queryString}`);
    }
};

// Inquiry API Calls
const inquiryAPI = {
    create: (data) => apiCall('/inquiries', {
        method: 'POST',
        body: data
    }),
    getPropertyInquiries: (propertyId) => apiCall(`/inquiries/property/${propertyId}`),
    updateStatus: (inquiryId, status) => apiCall(`/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        body: { status }
    }),
    getUserInquiries: () => apiCall('/inquiries/user/my-inquiries')
};

// Input Sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const element = document.createElement('div');
    element.textContent = input;
    return element.innerHTML;
}

// Form Validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhone(phone) {
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return regex.test(phone);
}

function validatePassword(password) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Currency Formatter
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Number Formatter
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Date Formatter
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);
    
    // Add CSS for toast if not already present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                background: white;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 2000;
                animation: slideIn 0.3s ease;
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .toast-success {
                background: #dcfce7;
                color: #166534;
                border-left: 4px solid #22c55e;
            }
            .toast-error {
                background: #fee2e2;
                color: #991b1b;
                border-left: 4px solid #ef4444;
            }
            .toast-info {
                background: #dbeafe;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export { apiCall, userAPI, propertyAPI, inquiryAPI, sanitizeInput, validateEmail, validatePhone, validatePassword, formatCurrency, formatNumber, formatDate, showToast };
