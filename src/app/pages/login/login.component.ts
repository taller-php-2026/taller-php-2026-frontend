import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      return;
    }
    // Mostrar error si Google OAuth falló y redirigió de vuelta con ?error=
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam === 'google_auth_failed') {
      this.errorMsg.set('No se pudo iniciar sesión con Google. Intentalo de nuevo.');
    }
  }

  loginWithGoogle() {
    window.location.href = environment.googleRedirectUrl;
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

    this.authService.loginHttp(this.email().trim(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 422) {
          this.errorMsg.set(err.error?.message ?? 'Credenciales incorrectas.');
        } else if (err.status === 0) {
          this.errorMsg.set('No se pudo conectar con el servidor.');
        } else {
          this.errorMsg.set('Error al iniciar sesión. Intentalo de nuevo.');
        }
      },
    });
  }
}
