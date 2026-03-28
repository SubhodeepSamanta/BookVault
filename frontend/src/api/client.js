import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bv_token');
      // Potential redirect to login logic here if needed, 
      // but usually handled by AuthContext state changes.
    }
    return Promise.reject(error);
  }
);

export default client;
