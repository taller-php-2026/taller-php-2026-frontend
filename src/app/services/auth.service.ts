import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<UserProfile | null>(null);
  isAuthenticated = signal<boolean>(false);
  userType = signal<'cliente' | 'profesional' | null>(null);
  private _pendingUser = signal<UserProfile | null>(null);

  constructor() {
    const session = this.loadSession();
    if (session) {
      this.currentUser.set(session.user);
      this.userType.set(session.type);
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
  }

  private loadSession(): { user: UserProfile; type: 'cliente' | 'profesional' } | null {
    const savedUser = localStorage.getItem('user_session');
    const savedType = localStorage.getItem('user_type') as 'cliente' | 'profesional' | null;
    if (!savedUser || !savedType) return null;
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
