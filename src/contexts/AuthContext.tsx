import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/services/api/client';
import type { Usuario, PerfilUsuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  temPermissao: (perfis: PerfilUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('usuario');
    if (token && savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, senha: string) => {
    const { data } = await apiClient.post('/auth/login', { email, senha });
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  };

  const signOut = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const temPermissao = useCallback(
    (perfis: PerfilUsuario[]) => {
      if (!usuario) return false;
      return perfis.includes(usuario.perfil);
    },
    [usuario]
  );

  return (
    <AuthContext.Provider value={{ usuario, loading, signIn, signOut, temPermissao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
