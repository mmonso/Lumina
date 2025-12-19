
import { User } from '../types';

const USERS_KEY = 'lumina_users';
const SESSION_KEY = 'lumina_session';

// Mock password hashing (simple hash for demo purposes, do not use in prod)
const hashPassword = (password: string): string => {
  return btoa(password);
};

import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {
  // Obtém a sessão atual do Supabase
  getSession: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
        avatar: session.user.user_metadata.avatar_url
      };
    }
    return null;
  },

  // Login real via Supabase
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata.name || data.user.email?.split('@')[0] || 'Usuário'
      };
      return { success: true, user };
    }

    return { success: false, error: 'Erro desconhecido no login.' };
  },

  // Logout real
  logout: async () => {
    await supabase.auth.signOut();
  },

  // Registro (se voltarmos a habilitar futuramente)
  register: async (name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    return { success: false, error: 'Registro temporariamente desabilitado.' };
  }
};

