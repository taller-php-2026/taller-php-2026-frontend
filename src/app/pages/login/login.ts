import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Campos para login manual
  username = signal('');
  password = signal('');
  errorMsg = signal('');
  loading = signal(false);
  showPassword = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  ngOnInit() {
    // Si ya está logueado, redirigir al inicio
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  // Inicializa Google Sign-In con el Client ID del usuario
  private initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '623580687397-vmu72m70i4sgo7e387k06ln5pveob468.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Renderiza el botón oficial de Google con diseño personalizado
      google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );

      // Opcional: Mostrar Google One Tap
      google.accounts.id.prompt();
    } else {
      // Reintentar en caso de que tarde en cargar el script
      setTimeout(() => this.initializeGoogleSignIn(), 500);
    }
  }

  // Procesa la respuesta de Google tras loguearse
  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      const payload = this.authService.decodeJwt(response.credential);
      if (payload) {
        this.authService.login({
          name: payload.name || payload.given_name,
          email: payload.email,
          picture: payload.picture
        });
        // Redirigir a elegir-tipo
        this.router.navigate(['/elegir-tipo']);
      }
    }
  }

  // Inicio de sesión manual para testing
  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.username() || !this.password()) {
      this.errorMsg.set('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    // Simular login exitoso tras 1 segundo
    setTimeout(() => {
      this.authService.login({
        name: this.username(),
        email: `${this.username()}@ejemplo.com`,
        picture: ''
      });
      this.loading.set(false);
      this.router.navigate(['/elegir-tipo']);
    }, 1000);
  }
}
