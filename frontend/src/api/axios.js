import axios from 'axios';

// Busca a URL base de qualquer uma das duas nomenclaturas comuns no .env
const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variáveis de controle para o Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// INTERCEPTADOR DE REQUISIÇÃO (Injeta o Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ags_token');

    // Proteção rigorosa contra strings inválidas do localStorage
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTADOR DE RESPOSTA (Renova o Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignora rota de auth para evitar loops infinitos
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('ags_refresh_token');

        if (!refreshToken || refreshToken === 'undefined') {
          throw new Error('Refresh token inválido ou ausente');
        }

        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

        localStorage.setItem('ags_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('ags_refresh_token', data.refreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        processQueue(null, data.accessToken);
        return api(originalRequest);
        
      } catch (err) {
        processQueue(err, null);
        
        // Em caso de falha irreversível do token, limpa a casa e chuta pro login
        console.warn('Sessão expirada. Redirecionando para login.');
        localStorage.removeItem('ags_token');
        localStorage.removeItem('ags_refresh_token');
        localStorage.removeItem('ags_user');
        window.location.href = '/login'; 
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;