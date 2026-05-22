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
  
  // Señal que indica si el usuario está autenticado
  isAuthenticated = signal<boolean>(false);
  // Señal del tipo de usuario (cliente o profesional)
  userType = signal<'cliente'|'profesional'|null>(null);

  constructor() {
    // Restaurar sesión desde localStorage al inicializar
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  // Definir tipo de usuario tras registro o login con Google
  setUserType(type: 'cliente' | 'profesional') {
    this.userType.set(type);
    localStorage.setItem('user_type', type);
  }

  // Obtener tipo de usuario guardado al iniciar la app
  private loadUserType() {
    const saved = localStorage.getItem('user_type');
    if (saved === 'cliente' || saved === 'profesional') {
      this.userType.set(saved);
    }
  }

  // Iniciar sesión
  login(user: UserProfile) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('user_session', JSON.stringify(user));
    // Si el tipo ya está definido en el objeto user, guardarlo
    if ((user as any).type) {
      this.setUserType((user as any).type);
    }
  }

  // Limpiar sesión al cerrar
  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.userType.set(null);
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
