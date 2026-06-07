import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterPayload } from '../../models/user.model';

type TouchedField =
  | 'nombre'
  | 'email'
  | 'telefono'
  | 'password'
  | 'confirmPassword'
  | 'nombreNegocio'
  | 'descripcion';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Tipo de cuenta
  tipo = signal<'cliente' | 'profesional'>('cliente');

  // Campos comunes
  nombre = signal('');
  email = signal('');
  telefono = signal('');
  password = signal('');
  confirmPassword = signal('');

  // Campos solo para profesional
  nombreNegocio = signal('');
  descripcion = signal('');

  // UI
  errorMsg = signal('');
  loading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  touched = signal<Record<TouchedField, boolean>>({
    nombre: false,
    email: false,
    telefono: false,
    password: false,
    confirmPassword: false,
    nombreNegocio: false,
    descripcion: false,
  });

  // Validaciones
  nombreValid = computed(() => this.nombre().trim().length >= 4);
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  telefonoValid = computed(() => this.telefono().replace(/\D/g, '').length >= 7);

  passwordHasUpper = computed(() => /[A-Z]/.test(this.password()));
  passwordHasNumber = computed(() => /[0-9]/.test(this.password()));
  passwordMinLength = computed(() => this.password().length >= 8);
  passwordValid = computed(
    () => this.passwordHasUpper() && this.passwordHasNumber() && this.passwordMinLength(),
  );
  passwordsMatch = computed(
    () => this.password() === this.confirmPassword() && this.confirmPassword().length > 0,
  );

  nombreNegocioValid = computed(() => this.nombreNegocio().trim().length >= 4);
  descripcionValid = computed(() => this.descripcion().trim().length >= 6);

  formValid = computed(() => {
    const base =
      this.nombreValid() &&
      this.emailValid() &&
      this.telefonoValid() &&
      this.passwordValid() &&
      this.passwordsMatch();
    return this.tipo() === 'profesional'
      ? base && this.nombreNegocioValid() && this.descripcionValid()
      : base;
  });

  touch(field: TouchedField) {
    this.touched.update((t) => ({ ...t, [field]: true }));
  }

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
  }
  toggleShowConfirm() {
    this.showConfirm.update((v) => !v);
  }

  selectTipo(tipo: 'cliente' | 'profesional') {
    this.tipo.set(tipo);
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.touched.set({
      nombre: true,
      email: true,
      telefono: true,
      password: true,
      confirmPassword: true,
      nombreNegocio: true,
      descripcion: true,
    });

    if (!this.formValid()) {
      this.errorMsg.set('Corrige los errores antes de continuar.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const payload: RegisterPayload = {
      nombre: this.nombre().trim(),
      email: this.email().toLowerCase().trim(),
      password: this.password(),
      password_confirmation: this.confirmPassword(),
      telefono: this.telefono().trim(),
      tipo: this.tipo(),
    };

    if (this.tipo() === 'profesional') {
      payload.nombreNegocio = this.nombreNegocio().trim();
      payload.descripcion = this.descripcion().trim();
    }

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors as Record<string, string[]>;
          const firstMessage = Object.values(errors).flat()[0];
          this.errorMsg.set(firstMessage ?? 'Error de validación.');
        } else if (err.error?.message) {
          this.errorMsg.set(err.error.message);
        } else if (err.status === 0) {
          this.errorMsg.set('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          this.errorMsg.set('Error al registrarse. Intentalo de nuevo.');
        }
      },
    });
  }
}
