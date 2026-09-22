import {
  AuthResponse,
  LoginCredentials,
  RegisterClientDto,
  RegisterProviderDto,
  User,
} from '@/types/auth';
import { INITIAL_MOCK_USERS, MockUserAccount } from '@/mocks/mockUsers';
import { apiClient, USE_MOCK } from './apiClient';

const STORAGE_USERS_KEY = 'mock_users_db';
const STORAGE_CURRENT_USER_KEY = 'current_user';
const STORAGE_TOKEN_KEY = 'auth_token';

class AuthService {
  private getStoredUsers(): MockUserAccount[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_USERS;
    const stored = localStorage.getItem(STORAGE_USERS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_USERS;
    }
  }

  private saveUsers(users: MockUserAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  private persistSession(authResponse: AuthResponse) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_TOKEN_KEY, authResponse.token);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(authResponse.user));
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: POST /api/auth/login
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      const authResponse = await apiClient.post<AuthResponse>('/auth/login', credentials);
      this.persistSession(authResponse);
      return authResponse;
    }

    // Simulación en memoria / LocalStorage para Sprint 1:
    await new Promise((resolve) => setTimeout(resolve, 400)); // Pequeña latencia realista

    const users = this.getStoredUsers();
    const account = users.find(
      (u) => u.user.email.toLowerCase() === credentials.email.trim().toLowerCase()
    );

    if (!account) {
      throw new Error('No existe una cuenta registrada con este correo electrónico.');
    }

    if (account.passwordHash !== credentials.password) {
      throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
    }

    const token = `mock_jwt_token_${account.user.id}_${Date.now()}`;
    const authResponse: AuthResponse = {
      token,
      user: account.user,
    };

    this.persistSession(authResponse);

    return authResponse;
  }

  async registerClient(data: RegisterClientDto): Promise<AuthResponse> {
    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: POST /api/auth/register/client
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      const authResponse = await apiClient.post<AuthResponse>('/auth/register/client', data);
      this.persistSession(authResponse);
      return authResponse;
    }

    // Simulación en memoria para Sprint 1:
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = this.getStoredUsers();
    const existing = users.find(
      (u) => u.user.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const newUser: User = {
      id: `usr_cli_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '+57 300 000 0000',
      city: data.city?.trim() || 'Medellín',
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };

    const newAccount: MockUserAccount = {
      user: newUser,
      passwordHash: data.password,
    };

    this.saveUsers([...users, newAccount]);

    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    const authResponse: AuthResponse = {
      token,
      user: newUser,
    };

    this.persistSession(authResponse);

    return authResponse;
  }

  async registerProvider(data: RegisterProviderDto): Promise<AuthResponse> {
    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: POST /api/auth/register/provider
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      const authResponse = await apiClient.post<AuthResponse>('/auth/register/provider', data);
      this.persistSession(authResponse);
      return authResponse;
    }

    // Simulación en memoria para Sprint 1:
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = this.getStoredUsers();
    const existing = users.find(
      (u) => u.user.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      throw new Error('Ya existe un proveedor registrado con este correo electrónico.');
    }

    const newProvider: User = {
      id: `usr_prov_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '+57 310 000 0000',
      businessName: data.businessName.trim(),
      businessCategory: data.businessCategory?.trim() || 'SALUD',
      address: data.address?.trim() || 'Principal',
      city: data.city?.trim() || 'Medellín',
      documentNumber: data.documentNumber?.trim(),
      role: 'PROVIDER',
      createdAt: new Date().toISOString(),
    };

    const newAccount: MockUserAccount = {
      user: newProvider,
      passwordHash: data.password,
    };

    this.saveUsers([...users, newAccount]);

    const token = `mock_jwt_token_${newProvider.id}_${Date.now()}`;
    const authResponse: AuthResponse = {
      token,
      user: newProvider,
    };

    this.persistSession(authResponse);

    return authResponse;
  }

  getCurrentSession(): { user: User | null; token: string | null } {
    if (typeof window === 'undefined') return { user: null, token: null };
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const userStr = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!token || !userStr) return { user: null, token: null };

    try {
      const user = JSON.parse(userStr) as User;
      return { user, token };
    } catch {
      return { user: null, token: null };
    }
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

export const authService = new AuthService();
