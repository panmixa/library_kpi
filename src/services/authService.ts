import api, { getUserProfile } from './api';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  secretKey?: string; // Optional secret key for admin registration
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
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.token) {
        this.setToken(response.data.token);
        
        // Спочатку отримуємо базову інформацію з токена
        let userData = this.parseUserDataFromToken(response.data.token);
        
        try {
          // Потім намагаємося отримати повний профіль користувача
          const profileData = await getUserProfile();
          console.log("Received profile data:", profileData);
          
          // Якщо отримали дані, оновлюємо ім'я користувача
          if (profileData && profileData.name) {
            userData = {
              ...userData,
              name: profileData.name
            };
          }
        } catch (profileError) {
          // Якщо не вдалося отримати профіль, використовуємо дані з токена
          console.warn('Could not fetch user profile:', profileError);
        }
        
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
      // Видаляємо поле secretKey перед відправленням на бекенд
      const { secretKey, ...userData } = credentials;
      
      const response = await api.post<AuthResponse>('/auth/register', {
        ...userData,
        role: userData.role || 'USER'
      });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        
        // Спочатку отримуємо базову інформацію з токена
        let userDataFromToken = this.parseUserDataFromToken(response.data.token);
        
        try {
          // Потім намагаємося отримати повний профіль користувача
          const profileData = await getUserProfile();
          console.log("Received profile data after registration:", profileData);
          
          // Якщо отримали дані, оновлюємо ім'я користувача
          if (profileData && profileData.name) {
            userDataFromToken = {
              ...userDataFromToken,
              name: profileData.name
            };
          } else {
            // Якщо профіль не містить імені, використовуємо ім'я з форми реєстрації
            userDataFromToken.name = credentials.name;
          }
        } catch (profileError) {
          // Якщо не вдалося отримати профіль, використовуємо ім'я з форми реєстрації
          console.warn('Could not fetch user profile after registration:', profileError);
          userDataFromToken.name = credentials.name;
        }
        
        this.setUser(userDataFromToken);
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
      // Видаляємо тільки авторизаційні дані, а не весь localStorage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('user_id');
      
      // Прибрано localStorage.clear() щоб не видаляти прогрес читання
  
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
      
      // Додаємо дебаг-інформацію для перевірки вмісту токена
      console.log('Decoded token:', decoded);
      
      // Отримуємо ID користувача
      const userId = decoded.id || decoded.userId || decoded.sub;
      
      // Отримуємо ім'я користувача з токена
      // Спробуємо різні можливі поля для імені
      const userName = decoded.name || decoded.username || decoded.fullName || 
                   decoded.firstName || decoded.preferred_username;
      
      // Формуємо об'єкт користувача
      const userData = {
        id: userId,
        email: decoded.sub || decoded.email,
        role: decoded.role?.replace('ROLE_', '') || 'USER',
        name: userName || (decoded.sub ? decoded.sub.split('@')[0] : 'User')
      };
      
      console.log('Generated user data:', userData);
      
      // Зберігаємо user_id в localStorage для використання в ReadingService
      if (userId) {
        localStorage.setItem('user_id', userId);
      }
      
      return userData;
    } catch (error) {
      console.error('Error parsing token:', error);
      throw new Error('Invalid token format');
    }
  }
}

export default new AuthService();
