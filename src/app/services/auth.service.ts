import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Estado reactivo del usuario logueado
  currentUser = signal<UserProfile | null>(null);

  // Solo true cuando hay sesión Y tipo elegido
  isAuthenticated = signal<boolean>(false);

  // Señal del tipo de usuario (cliente o profesional)
  userType = signal<'cliente' | 'profesional' | null>(null);

  // Usuario pendiente (registrado/google pero sin tipo elegido aún)
  pendingUser = signal<UserProfile | null>(null);

  constructor() {
    // Restaurar sesión desde localStorage al inicializar
    const savedUser = localStorage.getItem('user_session');
    const savedType = localStorage.getItem('user_type') as 'cliente' | 'profesional' | null;
    if (savedUser && savedType) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.userType.set(savedType);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  // Guardar usuario pendiente (antes de elegir tipo)
  setPendingUser(user: UserProfile) {
    this.pendingUser.set(user);
  }

  // Completar login: usuario + tipo elegido
  login(user: UserProfile) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('user_session', JSON.stringify(user));
    if ((user as any).type) {
      this.setUserType((user as any).type);
    }
  }

  // Definir tipo de usuario y completar sesión
  setUserType(type: 'cliente' | 'profesional') {
    this.userType.set(type);
    localStorage.setItem('user_type', type);

    // Si hay un pending, completar login ahora
    const pending = this.pendingUser();
    if (pending && !this.isAuthenticated()) {
      this.currentUser.set(pending);
      this.isAuthenticated.set(true);
      localStorage.setItem('user_session', JSON.stringify(pending));
      this.pendingUser.set(null);
    }
  }

  // Limpiar sesión al cerrar
  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.userType.set(null);
    this.pendingUser.set(null);
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_type');
  }

  // Decodificar el ID Token de Google (JWT)
  decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
