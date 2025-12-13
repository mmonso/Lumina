
import { User } from '../types';

const USERS_KEY = 'lumina_users';
const SESSION_KEY = 'lumina_session';

// Mock password hashing (simple hash for demo purposes, do not use in prod)
const hashPassword = (password: string): string => {
  return btoa(password);
};

export const authService = {
  getUsers: (): any[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  getSession: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  login: (email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === hashPassword(password));

    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Credenciais inválidas.' };
  },

  register: (name: string, email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const users = authService.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'E-mail já cadastrado.' };
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email,
      password: hashPassword(password)
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

    return { success: true, user: safeUser };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
