import api from './api';
import type { User } from './api';

export const googleLogin = async (idToken: string): Promise<User & { token: string }> => {
  const res = await api.post('/api/auth/google/', { id_token: idToken });
  const { token, email, name, picture, role } = res.data;
  localStorage.setItem('auth_token', token);
  const user: User & { token: string } = { id: 0, token, email, name, picture, role };
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
};

export const fetchMe = async (): Promise<User> => {
  const res = await api.get<User>('/api/auth/me/');
  localStorage.setItem('auth_user', JSON.stringify(res.data));
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export const getStoredUser = (): (User & { token: string }) | null => {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
};

export const getToken = () => localStorage.getItem('auth_token');
