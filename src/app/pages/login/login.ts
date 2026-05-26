import { Component, inject, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
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

  // Validaciones
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  passwordMinLength = computed(() => this.password().length >= 6);
  formValid = computed(() => this.emailValid() && this.passwordMinLength());

  togglePasswordVisibility() { this.showPassword.update(val => !val); }

  touch(field: 'email' | 'password') {
    this.touched.update(t => ({ ...t, [field]: true }));
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
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );

      google.accounts.id.prompt();
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 500);
    }
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      const payload = this.authService.decodeJwt(response.credential);
      if (payload) {
        // No login real hasta elegir tipo
        this.authService.setPendingUser({
          name: payload.name || payload.given_name,
          email: payload.email,
          picture: payload.picture
        });
        this.router.navigate(['/elegir-tipo']);
      }
    }
  }

  private goToChooseType() {
    this.authService.setPendingUser({
      name: this.email().split('@')[0],
      email: this.email(),
      picture: ''
    });
    this.loading.set(false);
    this.router.navigate(['/elegir-tipo']);
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

    const emailEntered = this.email().toLowerCase().trim();

    // Intentar buscar en mock-usuario.json
    this.http.get<any>('/mock-usuario.json').subscribe({
      next: (userMock) => {
        if (userMock.email.toLowerCase().trim() === emailEntered) {
          setTimeout(() => {
            if (userMock.contrasena && userMock.contrasena !== this.password()) {
              this.errorMsg.set('Contraseña incorrecta.');
              this.loading.set(false);
              return;
            }
            if (userMock.rol) {
              this.authService.login({
                name: userMock.nombre,
                email: userMock.email,
                picture: userMock.picture || ''
              });
              this.authService.setUserType(userMock.rol);
              this.loading.set(false);
              this.router.navigate(['/']);
            } else {
              this.goToChooseType();
            }
          }, 800);
          return;
        }

        // Si no es el cliente, intentar en mock-profesional.json
        this.http.get<any>('/mock-profesional.json').subscribe({
          next: (profMock) => {
            if (profMock.email.toLowerCase().trim() === emailEntered) {
              setTimeout(() => {
                if (profMock.contrasena && profMock.contrasena !== this.password()) {
                  this.errorMsg.set('Contraseña incorrecta.');
                  this.loading.set(false);
                  return;
                }
                if (profMock.rol) {
                  this.authService.login({
                    name: profMock.nombre,
                    email: profMock.email,
                    picture: profMock.picture || ''
                  });
                  this.authService.setUserType(profMock.rol);
                  this.loading.set(false);
                  this.router.navigate(['/']);
                } else {
                  this.goToChooseType();
                }
              }, 800);
              return;
            }

            // Flujo normal si no es ningún mock
            setTimeout(() => this.goToChooseType(), 800);
          },
          error: () => setTimeout(() => this.goToChooseType(), 800)
        });
      },
      error: () => {
        // En caso de que falle la carga (ej. CORS o 404), intentar en mock-profesional.json directamente
        this.http.get<any>('/mock-profesional.json').subscribe({
          next: (profMock) => {
            if (profMock.email.toLowerCase().trim() === emailEntered) {
              setTimeout(() => {
                if (profMock.contrasena && profMock.contrasena !== this.password()) {
                  this.errorMsg.set('Contraseña incorrecta.');
                  this.loading.set(false);
                  return;
                }
                if (profMock.rol) {
                  this.authService.login({
                    name: profMock.nombre,
                    email: profMock.email,
                    picture: profMock.picture || ''
                  });
                  this.authService.setUserType(profMock.rol);
                  this.loading.set(false);
                  this.router.navigate(['/']);
                } else {
                  this.goToChooseType();
                }
              }, 800);
              return;
            }
            setTimeout(() => this.goToChooseType(), 800);
          },
          error: () => setTimeout(() => this.goToChooseType(), 800)
        });
      }
    });
  }
}
