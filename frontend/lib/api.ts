import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', new URLSearchParams(data as any), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: { email: string; password: string; first_name?: string; last_name?: string; age?: number; phone_number?: string; telegram_username?: string; role: string }) =>
    api.post('/api/auth/register', data),
};

export const trainingApi = {
  list: () => api.get('/api/trainings/'),
  create: (data: { title: string; date: string; start_time: string; end_time: string; capacity: number; client_id?: number; status?: string }) =>
    api.post('/api/trainings/', data),
  get: (id: number) => api.get(`/api/trainings/${id}`),
  delete: (id: number) => api.delete(`/api/trainings/${id}`),
};

export const trainingTypesApi = {
  list: () => api.get('/api/training_types/'),
  create: (data: { name: string; duration_minutes: number; cost: number }) => api.post('/api/training_types/', data),
  delete: (id: number) => api.delete(`/api/training_types/${id}`),
};

export const bookingApi = {
  book: (trainingId: number) => api.post('/api/bookings/', { training_id: trainingId }),
  myBookings: () => api.get('/api/bookings/my-bookings'),
  allBookings: () => api.get('/api/bookings/all'),
  markPaid: (bookingId: number) => api.put(`/api/bookings/${bookingId}/pay`),
};

export const statsApi = {
  dashboard: () => api.get('/api/stats/dashboard'),
  finances: () => api.get('/api/stats/finances'),
  exportCsv: () => api.get('/api/stats/export/csv', { responseType: 'blob' }),
};

export const userApi = {
  listClients: () => api.get('/api/users/'),
  me: () => api.get('/api/users/me'),
  updateMe: (data: { full_name?: string; email?: string; contact_info?: string }) =>
    api.put('/api/users/me', data),
  updateClient: (id: number, data: any) => api.put(`/api/users/${id}`, data),
  deleteClient: (id: number) => api.delete(`/api/users/${id}`),
};
