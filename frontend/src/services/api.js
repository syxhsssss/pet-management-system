import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== 认证相关 ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ==================== 宠物相关 ====================
export const petAPI = {
  getAllPets: () => api.get('/pets'),
  getPetById: (id) => api.get(`/pets/${id}`),
  createPet: (petData) => api.post('/pets', petData),
  updatePet: (id, petData) => api.put(`/pets/${id}`, petData),
  deletePet: (id) => api.delete(`/pets/${id}`),
};

// ==================== 收养相关 ====================
export const adoptionAPI = {
  getAllAdoptions: (params) => api.get('/adoption/adoptions', { params }),
  getAdoptionById: (id) => api.get(`/adoption/adoptions/${id}`),
  createAdoption: (data) => api.post('/adoption/adoptions', data),
  applyForAdoption: (id, data) => api.post(`/adoption/adoptions/${id}/apply`, data),
  getMyApplications: () => api.get('/adoption/my-applications'),
};

// ==================== 商城相关 ====================
export const shopAPI = {
  getAllProducts: (params) => api.get('/shop/products', { params }),
  getProductById: (id) => api.get(`/shop/products/${id}`),
  getCart: () => api.get('/shop/cart'),
  addToCart: (data) => api.post('/shop/cart', data),
  updateCartItem: (id, data) => api.put(`/shop/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/shop/cart/${id}`),
  createOrder: (data) => api.post('/shop/orders', data),
  getMyOrders: () => api.get('/shop/my-orders'),
};

// ==================== 社交相关 ====================
export const socialAPI = {
  getAllPosts: (params) => api.get('/social/posts', { params }),
  getPostById: (id) => api.get(`/social/posts/${id}`),
  getUserPosts: (userId) => api.get(`/social/users/${userId}/posts`),
  createPost: (data) => api.post('/social/posts', data),
  deletePost: (id) => api.delete(`/social/posts/${id}`),
  toggleLike: (id) => api.post(`/social/posts/${id}/like`),
  addComment: (id, data) => api.post(`/social/posts/${id}/comments`, data),
  getTags: () => api.get('/social/tags'),
  getPopularTags: (limit) => api.get('/social/tags/popular', { params: { limit } }),
};

// ==================== 图片上传相关 ====================
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post('http://localhost:3001/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return axios.post('http://localhost:3001/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
