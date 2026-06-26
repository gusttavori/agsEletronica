// src/api/auth.js
import api from './axios';

const authApi = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    // CRÍTICO: Retorne explicitamente o .data
    return response.data; 
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    // Mesmo que não retorne nada útil, evite retornar o objeto Axios
    await api.post('/auth/logout'); 
  }
};

export default authApi;