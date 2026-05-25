import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  errorMsg = signal('');
  loading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);
  touched = signal({ username: false, email: false, password: false, confirmPassword: false });

  // Validaciones username
  usernameMinLength = computed(() => this.username().length >= 4);
  usernameValid = computed(() => this.usernameMinLength());

  // Validaciones email
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));

  // Validaciones password
  passwordHasUpper = computed(() => /[A-Z]/.test(this.password()));
  passwordHasNumber = computed(() => /[0-9]/.test(this.password()));
  passwordMinLength = computed(() => this.password().length >= 8);
  passwordValid = computed(() => this.passwordHasUpper() && this.passwordHasNumber() && this.passwordMinLength());

  // Confirmación
  passwordsMatch = computed(() => this.password() === this.confirmPassword() && this.confirmPassword().length > 0);

  // Formulario válido globalmente
  formValid = computed(() =>
    this.usernameValid() && this.emailValid() && this.passwordValid() && this.passwordsMatch()
  );

  touch(field: 'username' | 'email' | 'password' | 'confirmPassword') {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  toggleShowPassword() { this.showPassword.update(v => !v); }
  toggleShowConfirm() { this.showConfirm.update(v => !v); }

  onSubmit(event: Event) {
    event.preventDefault();
    // Marcar todos como touched
    this.touched.set({ username: true, email: true, password: true, confirmPassword: true });

    if (!this.formValid()) {
      this.errorMsg.set('Corrige los errores antes de continuar.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    // Guardar como pendiente sin hacer login real
    setTimeout(() => {
      this.authService.setPendingUser({
        name: this.username(),
        email: this.email(),
        picture: ''
      });
      this.loading.set(false);
      this.router.navigate(['/elegir-tipo']);
    }, 800);
  }
}
