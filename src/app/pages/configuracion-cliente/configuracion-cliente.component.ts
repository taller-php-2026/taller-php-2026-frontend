import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { COUNTRIES, Country } from '../../models/countries.model';

@Component({
  selector: 'app-configuracion-cliente',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracion-cliente.component.html',
  styleUrl: './configuracion-cliente.component.css'
})
export class ConfiguracionClienteComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  countries: Country[] = COUNTRIES;
  countryIndex = '0';

  get selectedCountry(): Country {
    return this.countries[+this.countryIndex];
  }

  onCountryChange(idx: string) {
    this.countryIndex = idx;
    this.phone.set('');
  }

  // Signals para enlace del formulario
  name = signal('Cargando...');
  email = signal('cargando@example.com');
  phone = signal('');
  picture = signal('https://lh3.googleusercontent.com/aida-public/AB6AXuBBKFPIdwAwenLkQteMIQWDlbgG8uvhw5MMKIvA3_5bgEVxssOevl0oJGWDBLG0eYr65t0MRDoPYl2do2C6nINYsoFZpCxNlN0KLhl12DhYMXrK0WXLigcA1Sq5JCDDQ7FuSnp6T3iIHPNpQ1fyEXmhZmmfDpyEJMamYk1-3CwxRMG9hLcyllr9FeI1ZAjWAui9O26FbzB8lpqfUHP21I6ul-lioYyFOiQvzGEH_UpP92-x16wUUFUIhAdSRXr7HGKqwTnN1XrgWyuy');
  password = signal('');
  confirmPassword = signal('');

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  showConfirm = signal(false);
  selectedFile: File | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.idUsuario) {
      this.cargarUsuario();
    } else {
      this.errorMsg.set('No se ha podido identificar al usuario actual.');
    }
  }

  cargarUsuario() {
    this.authService.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const user = res.usuario;
        if (!user) return;
        this.name.set(user.nombre);
        this.email.set(user.email);
        if (user.telefono) {
          // Detectar código de país
          const matchedCountry = this.countries.findIndex(c => user.telefono!.startsWith(c.dial));
          if (matchedCountry !== -1) {
            this.countryIndex = matchedCountry.toString();
            const tel = user.telefono!.replace(this.selectedCountry.dial, '').trim();
            this.phone.set(tel);
          } else {
            this.phone.set(user.telefono!);
          }
        }
        if (user.imagenPerfilUrl) {
          this.picture.set(user.imagenPerfilUrl);
        }
      },
      error: () => {
        this.errorMsg.set('Error al cargar la información del perfil.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  toggleShowConfirm() {
    this.showConfirm.update(v => !v);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.picture.set(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveChanges() {
    const user = this.authService.currentUser();
    if (!user?.idUsuario) {
      this.errorMsg.set('No se pudo identificar al usuario logueado.');
      return;
    }

    // 1. Validación de Nombre
    if (this.name().trim().length < 4) {
      this.errorMsg.set('El nombre debe tener al menos 4 caracteres.');
      return;
    }

    // 2. Validación de Correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMsg.set('El correo electrónico no es válido.');
      return;
    }

    // 3. Validación de Teléfono (según país)
    if (this.phone()) {
      const pattern = this.selectedCountry.phonePattern;
      if (!pattern.test(this.phone())) {
        this.errorMsg.set(`El teléfono no es válido para ${this.selectedCountry.name}. Formato: ${this.selectedCountry.placeholder}`);
        return;
      }
    }

    // 4. Validación de Contraseña
    if (this.password()) {
      const pass = this.password();
      const hasUpper = /[A-Z]/.test(pass);
      const hasNumber = /[0-9]/.test(pass);
      const minLength = pass.length >= 8;

      if (!minLength || !hasUpper || !hasNumber) {
        this.errorMsg.set('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
        return;
      }

      if (this.password() !== this.confirmPassword()) {
        this.errorMsg.set('Las contraseñas no coinciden.');
        return;
      }
    }

    this.loading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const payload: any = {
      nombre: this.name(),
      email: this.email(),
      telefono: this.phone() ? `${this.selectedCountry.dial} ${this.phone()}` : ''
    };

    if (this.password()) {
      payload.password = this.password();
    }

    this.authService.updateMyProfile(payload).pipe(
      switchMap((updateRes) => {
        if (this.selectedFile) {
          return this.authService.uploadMyImage(this.selectedFile);
        }
        return of(updateRes);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        const updated = res.data;
        const newProfile = {
          idUsuario: updated.idUsuario,
          name: updated.nombre,
          email: updated.email,
          picture: updated.imagenPerfilUrl || '',
          telefono: updated.telefono,
          type: user.type,
          imagenPerfilUrl: updated.imagenPerfilUrl,
          imagenPerfilPublicId: updated.imagenPerfilPublicId,
          profesional: updated.profesional
        };

        this.authService.currentUser.set(newProfile);

        this.loading.set(false);
        this.successMsg.set('¡Cambios guardados con éxito!');
        setTimeout(() => {
          this.successMsg.set('');
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Error al guardar los cambios.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
