import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  UserProfile,
  AuthResponse,
  RegisterPayload,
  BackendUsuario,
  CompletarPerfilPayload,
} from '../models/user.model';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<UserProfile | null>(null);
  isAuthenticated = signal<boolean>(false);
  userType = signal<'cliente' | 'profesional' | null>(null);
  private _pendingUser = signal<UserProfile | null>(null);

  constructor() {
    const session = this.loadSession();
    if (session) {
      this.currentUser.set(session.user);
      if (session.type) {
        this.userType.set(session.type);
      }
      this.isAuthenticated.set(true);
    }
  }

  setPendingUser(user: UserProfile) {
    this._pendingUser.set(user);
  }

  login(user: UserProfile) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (user.type) {
      this.setUserType(user.type);
    }
    this.saveSession(user, user.type ?? this.userType()!);
  }

  setUserType(type: 'cliente' | 'profesional') {
    this.userType.set(type);
    localStorage.setItem('user_type', type);
  }

  completePendingLogin() {
    const pending = this._pendingUser();
    if (pending && !this.isAuthenticated()) {
      this.currentUser.set(pending);
      this.isAuthenticated.set(true);
      this._pendingUser.set(null);
      this.saveSession(pending, this.userType()!);
    }
  }

  /** Guarda sesión a partir de la respuesta del backend (login/register reales). */
  setSession(token: string, backendUser: BackendUsuario): void {
    const tipo = backendUser.tipoPrincipal ?? null;
    const user: UserProfile = {
      idUsuario: backendUser.idUsuario,
      name: backendUser.nombre,
      email: backendUser.email,
      picture: '',
      type: tipo ?? undefined,
    };
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_session', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (tipo) {
      this.userType.set(tipo);
      localStorage.setItem('user_type', tipo);
    }
  }

  /**
   * Guarda sesión parcial: token + datos básicos, sin tipo/rol.
   * Usado cuando Google OAuth crea un usuario nuevo que aún debe completar perfil.
   */
  setPartialSession(token: string, backendUser: BackendUsuario): void {
    const user: UserProfile = {
      idUsuario: backendUser.idUsuario,
      name: backendUser.nombre,
      email: backendUser.email,
      picture: '',
    };
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_session', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    // userType queda en null intencionalmente
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res.access_token, res.usuario)));
  }

  loginHttp(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.setSession(res.access_token, res.usuario)));
  }

  completarPerfil(payload: CompletarPerfilPayload): Observable<AuthResponse> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/completar-perfil`, payload, { headers })
      .pipe(tap((res) => this.setSession(res.access_token, res.usuario)));
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.userType.set(null);
    this._pendingUser.set(null);
    this.clearSession();
  }

  private saveSession(user: UserProfile, type: 'cliente' | 'profesional') {
    localStorage.setItem('user_session', JSON.stringify(user));
    localStorage.setItem('user_type', type);
  }

  private clearSession() {
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access_token');
  }

  private loadSession(): { user: UserProfile; type: 'cliente' | 'profesional' | null } | null {
    const savedUser = localStorage.getItem('user_session');
    if (!savedUser) return null;
    const savedType = localStorage.getItem('user_type') as 'cliente' | 'profesional' | null;
    try {
      return { user: JSON.parse(savedUser), type: savedType };
    } catch {
      return null;
    }
  }

  get hasPendingUser() {
    return this._pendingUser() !== null;
  }

  getUserType() {
    return this.userType();
  }
}
