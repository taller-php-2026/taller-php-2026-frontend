import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

import { COUNTRIES, Country } from '../../models/countries.model';

@Component({
  selector: 'app-elegir-tipo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './elegir-tipo.component.html',
  styleUrl: './elegir-tipo.component.css',
})
export class ElegirTipoComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  selectedRole: 'cliente' | 'profesional' = 'cliente';
  phone = signal('');
  nombreNegocio = signal('');
  descripcion = signal('');
  termsAccepted = signal(false);
  errorMsg = signal('');
  loading = signal(false);

  touched = signal({
    phone: false,
    nombreNegocio: false,
    descripcion: false,
    terms: false,
  });

  countries: Country[] = COUNTRIES;

  // Índice string para ngModel — evita la opción vacía extra de Angular
  countryIndex = '0'; // Uruguay por defecto

  get selectedCountry(): Country {
    return this.countries[+this.countryIndex];
  }

  onCountryChange(idx: string) {
    this.countryIndex = idx;
    this.phone.set('');
    this.touch('phone');
  }

  phoneValid = computed(() =>
    this.countries[+this.countryIndex].phonePattern.test(this.phone().replace(/\s/g, '')),
  );

  nombreNegocioValid = computed(() => this.nombreNegocio().trim().length >= 4);
  descripcionValid = computed(() => this.descripcion().trim().length > 5);

  formValid = computed(() => {
    const base = this.phoneValid() && this.termsAccepted();
    return this.selectedRole === 'profesional'
      ? base && this.nombreNegocioValid() && this.descripcionValid()
      : base;
  });

  touch(field: 'phone' | 'nombreNegocio' | 'descripcion' | 'terms') {
    this.touched.update((t) => ({ ...t, [field]: true }));
  }

  ngOnInit() {
    // Sesión completa con tipo → ya puede usar la app
    if (this.auth.isAuthenticated() && this.auth.userType()) {
      this.router.navigate(['/']);
      return;
    }
    // Sin ninguna sesión → debe loguearse primero
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
    // Caso válido: autenticado pero sin tipo (sesión parcial de Google OAuth)
  }

  completarRegistro() {
    this.touched.set({ phone: true, nombreNegocio: true, descripcion: true, terms: true });
    if (!this.formValid()) {
      this.errorMsg.set('Corrige los errores antes de continuar.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const telefono = this.selectedCountry.dial + this.phone().replace(/\s/g, '');
    const payload =
      this.selectedRole === 'profesional'
        ? {
            tipo: 'profesional' as const,
            telefono,
            nombreNegocio: this.nombreNegocio().trim(),
            descripcion: this.descripcion().trim(),
          }
        : { tipo: 'cliente' as const, telefono };

    this.auth.completarPerfil(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 422 && err.error?.errors) {
          const msgs = Object.values(err.error.errors as Record<string, string[]>)
            .flat()
            .join(' ');
          this.errorMsg.set(msgs);
        } else if (err.error?.message) {
          this.errorMsg.set(err.error.message);
        } else {
          this.errorMsg.set('Error al completar el perfil. Intenta de nuevo.');
        }
      },
    });
  }
}
