import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

import { COUNTRIES, Country } from '../../models/countries.model';

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [FormsModule, UpperCasePipe, CommonModule],
  templateUrl: './configuracion-negocio.component.html',
  styleUrl: './configuracion-negocio.component.css'
})
export class ConfiguracionNegocioComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);

  countries: Country[] = COUNTRIES;
  countryIndex = '0';

  get selectedCountry(): Country {
    return this.countries[+this.countryIndex];
  }

  onCountryChange(idx: string) {
    this.countryIndex = idx;
    this.phone.set('');
  }

  // Datos de usuario profesional
  name = signal('Cargando...');
  email = signal('cargando@example.com');
  phone = signal('');
  picture = signal('');
  password = signal('');
  confirmPassword = signal('');
  showConfirm = signal(false);
  selectedFile: File | null = null;

  // Comprobar si el usuario inicio sesion a traves de Google (mirando la imagen o el formato)
  esUsuarioGoogle(): boolean {
    const user = this.authService.currentUser();
    return !!(user?.picture && user.picture.includes('googleusercontent.com'));
  }

  // Datos comerciales y visuales del negocio
  businessName = signal('Cargando...');
  primaryColor = signal('#00685F');

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  brandConfigKey = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.idUsuario) {
      this.brandConfigKey = `brand_config_${user.idUsuario}`;
      this.cargarMiPerfil();
    } else {
      this.errorMsg.set('No se pudo identificar al profesional actual.');
    }
  }

  cargarMiPerfil() {
    this.authService.getMe().subscribe({
      next: (res) => {
        const user = res.usuario;
        if (!user) return;

        this.name.set(user.nombre);
        this.email.set(user.email);
        this.businessName.set(user.profesional?.nombreNegocio || user.nombre || '');

        if (user.profesional?.color) {
          this.primaryColor.set(user.profesional.color);
          this.aplicarEstilosMarca({ primaryColor: user.profesional.color });
        }

        if (user.telefono) {
          const matchedCountry = this.countries.findIndex(c => user.telefono?.startsWith(c.dial));
          if (matchedCountry !== -1) {
            this.countryIndex = matchedCountry.toString();
            const tel = user.telefono.replace(this.selectedCountry.dial, '').trim();
            this.phone.set(tel);
          } else {
            this.phone.set(user.telefono);
          }
        }

        if (user.imagenPerfilUrl) {
          this.picture.set(user.imagenPerfilUrl);
        }
      },
      error: () => {
        this.errorMsg.set('Error al cargar la informacion del perfil del usuario.');
      }
    });
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

  toggleShowConfirm() {
    this.showConfirm.update(v => !v);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  saveChanges() {
    const idProf = this.authService.currentUser()?.idUsuario;
    if (!idProf) {
      this.errorMsg.set('No se pudo identificar al profesional logueado.');
      return;
    }

    if (!this.businessName().trim()) {
      this.errorMsg.set('El nombre comercial es requerido.');
      return;
    }

    if (this.name().trim().length < 4) {
      this.errorMsg.set('El nombre de usuario debe tener al menos 4 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMsg.set('El correo electrónico no es válido.');
      return;
    }

    if (this.phone()) {
      const pattern = this.selectedCountry.phonePattern;
      if (!pattern.test(this.phone())) {
        this.errorMsg.set(`El teléfono no es válido para ${this.selectedCountry.name}. Formato: ${this.selectedCountry.placeholder}`);
        return;
      }
    }

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
    this.errorMsg.set('');
    this.successMsg.set('');

    const userPayload: any = {
      nombre: this.name(),
      email: this.email(),
      telefono: this.phone() ? `${this.selectedCountry.dial} ${this.phone()}` : ''
    };

    if (this.password()) {
      userPayload.password = this.password();
    }

    this.authService.updateMyProfile({
      ...userPayload,
      nombreNegocio: this.businessName(),
      color: this.primaryColor(),
    }).subscribe({
      next: (res) => {
        if (res.data) {
          this.authService.updateCurrentUserFromBackend(res.data);
        }
        if (this.selectedFile) {
          this.authService.uploadMyImage(this.selectedFile).subscribe({
            next: () => this.finalizarGuardado(),
            error: (err) => {
              this.loading.set(false);
              this.errorMsg.set(err?.error?.message || 'Error al subir la imagen de perfil.');
            },
          });
          return;
        }

        this.finalizarGuardado();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Error al guardar la configuracion.');
      }
    });
  }

  private finalizarGuardado(): void {
    this.aplicarEstilosMarca({ primaryColor: this.primaryColor() });

    this.loading.set(false);
    this.successMsg.set('Configuracion guardada correctamente.');
    setTimeout(() => {
      this.goBack();
    }, 1200);
  }

  aplicarEstilosMarca(config: any) {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
  }
}
