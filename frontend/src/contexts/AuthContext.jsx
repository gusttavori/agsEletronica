import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Função blindada para padronizar o usuário, não importa como o backend mande os nomes dos campos
  const formatarUsuario = (dadosBrutos) => {
    if (!dadosBrutos) return null;
    return {
      ...dadosBrutos,
      nome: dadosBrutos.nome || dadosBrutos.name || dadosBrutos.usuario || 'Usuário',
      role: dadosBrutos.role || dadosBrutos.perfil || dadosBrutos.tipo || 'TECNICO'
    };
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('ags_token');
    const cachedUserString = localStorage.getItem('ags_user');

    if (!token || !cachedUserString || cachedUserString === 'undefined') {
      setIsLoading(false);
      return;
    }

    let parsedCache = null;

    // 1. Carrega o cache garantindo que o JSON é válido
    try {
      parsedCache = JSON.parse(cachedUserString);
      setUser(formatarUsuario(parsedCache));
      setIsLoading(false); // Libera a tela imediatamente para não piscar
    } catch (e) {
      console.error("Cache de usuário corrompido.");
      setIsLoading(false);
    }

    // 2. Validação silenciosa no background
    try {
      if (authApi.getMe) {
        const response = await authApi.getMe();
        const userData = response?.data?.user || response?.data || response?.user || response;
        
        if (userData) {
          // O PULO DO GATO: Mescla os dados do getMe com o Cache! 
          // Assim, se o getMe esquecer de mandar a 'role', o cache salva a pátria.
          const mergedUser = { ...parsedCache, ...userData };
          const usuarioFinal = formatarUsuario(mergedUser);
          
          setUser(usuarioFinal);
          localStorage.setItem('ags_user', JSON.stringify(usuarioFinal));
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn('Sessão expirada. Deslogando...');
        localStorage.removeItem('ags_token');
        localStorage.removeItem('ags_refresh_token');
        localStorage.removeItem('ags_user');
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, senha) => {
    try {
      const response = await authApi.login(email, senha);
      
      // Extração de token à prova de falhas
      const payload = response?.data || response;
      const accessToken = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      if (!accessToken) {
        throw new Error('A API não retornou o token de acesso.');
      }

      localStorage.setItem('ags_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('ags_refresh_token', refreshToken);
      }
      
      // Tenta achar o objeto do usuário na resposta
      let rawUser = payload.user || payload.usuario || payload;
      
      const usuarioFormatado = formatarUsuario(rawUser);
      setUser(usuarioFormatado);
      localStorage.setItem('ags_user', JSON.stringify(usuarioFormatado));
      
      return usuarioFormatado;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authApi.logout) await authApi.logout();
    } catch (error) {
      // Ignora erros de logout
    } finally {
      localStorage.removeItem('ags_token');
      localStorage.removeItem('ags_refresh_token');
      localStorage.removeItem('ags_user');
      setUser(null);
      window.location.href = '/login'; // Força a ida pro login para limpar a memória do React
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;