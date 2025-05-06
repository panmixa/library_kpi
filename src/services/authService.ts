import api from './api';
import { jwtDecode } from 'jwt-decode';
import { encrypt } from '../utils/encryption';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
}

export interface UserData {
  id?: string;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Encrypt sensitive data before sending
      const encryptedCredentials = {
        encryptedData: encrypt(credentials)
      };
      
      const response = await api.post<AuthResponse>('/auth/login', encryptedCredentials);
      if (response.data.token) {
        this.setToken(response.data.token);
        const userData = this.parseUserDataFromToken(response.data.token);
        this.setUser(userData);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Encrypt sensitive data before sending
      const encryptedCredentials = {
        encryptedData: encrypt(credentials)
      };
      
      const response = await api.post<AuthResponse>('/auth/register', encryptedCredentials);
      if (response.data.token) {
        this.setToken(response.data.token);
        const userData = this.parseUserDataFromToken(response.data.token);
        this.setUser(userData);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.clear();

      api.defaults.headers.common['Authorization'] = '';
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: UserData): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  getUser(): UserData | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (!userStr) {
        const token = this.getToken();
        if (token) {
          const userData = this.parseUserDataFromToken(token);
          this.setUser(userData);
          return userData;
        }
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  private parseUserDataFromToken(token: string): UserData {
    try {
      const decoded: any = jwtDecode(token);
      return {
        email: decoded.sub,
        role: decoded.role?.replace('ROLE_', '') || 'USER',
        name: decoded.name || decoded.sub.split('@')[0]
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      throw new Error('Invalid token format');
    }
  }
}

export default new AuthService();
