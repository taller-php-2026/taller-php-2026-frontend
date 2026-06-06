import { Component, inject, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { decodeJwt } from 'app/utils/jwt.utils';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  email = signal('');
  password = signal('');
  errorMsg = signal('');
  loading = signal(false);
  showPassword = signal(false);
  touched = signal({ email: false, password: false });

  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  passwordMinLength = computed(() => this.password().length >= 6);
  formValid = computed(() => this.emailValid() && this.passwordMinLength());

  togglePasswordVisibility() {
    this.showPassword.update((val) => !val);
  }

  touch(field: 'email' | 'password') {
    this.touched.update((t) => ({ ...t, [field]: true }));
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '623580687397-vmu72m70i4sgo7e387k06ln5pveob468.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      google.accounts.id.renderButton(document.getElementById('google-btn-container'), {
        theme: 'outline',
        size: 'large',
        width: 350,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
      google.accounts.id.prompt();
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 500);
    }
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      const payload = decodeJwt(response.credential);
      if (payload) {
        this.authService.setPendingUser({
          name: payload.name || payload.given_name,
          email: payload.email,
          picture: payload.picture,
        });
        this.router.navigate(['/elegir-tipo']);
      }
    }
  }

  private goToChooseType() {
    this.authService.setPendingUser({
      name: this.email().split('@')[0],
      email: this.email(),
      picture: '',
    });
    this.loading.set(false);
    this.router.navigate(['/elegir-tipo']);
  }

  private tryLoginWithMock(mock: any): boolean {
    if (mock.email.toLowerCase().trim() !== this.email().toLowerCase().trim()) return false;

    if (mock.contrasena && mock.contrasena !== this.password()) {
      this.errorMsg.set('Contraseña incorrecta.');
      this.loading.set(false);
      return true;
    }

    if (mock.rol) {
      this.authService.login({ name: mock.nombre, email: mock.email, picture: mock.picture || '' });
      this.authService.setUserType(mock.rol);
      this.authService.completePendingLogin();
      this.loading.set(false);
      this.router.navigate(['/']);
    } else {
      this.goToChooseType();
    }
    return true;
  }

  private tryProfMock() {
    this.http.get<any>('/mock-profesional.json').subscribe({
      next: (profMock) => {
        if (this.tryLoginWithMock(profMock)) return;
        setTimeout(() => this.goToChooseType(), 800);
      },
      error: () => setTimeout(() => this.goToChooseType(), 800),
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.touched.set({ email: true, password: true });

    if (!this.formValid()) {
      this.errorMsg.set('Corrige los errores antes de continuar.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.http.get<any>('/mock-usuario.json').subscribe({
      next: (userMock) => {
        if (this.tryLoginWithMock(userMock)) return;
        this.tryProfMock();
      },
      error: () => this.tryProfMock(),
    });
  }
}
