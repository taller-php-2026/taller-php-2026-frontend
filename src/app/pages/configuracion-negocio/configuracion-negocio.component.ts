import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';

interface Country {
  code: string;
  name: string;
  flag: string;
  dial: string;
  phonePattern: RegExp;
  placeholder: string;
  example: string;
}

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [FormsModule, UpperCasePipe, CommonModule],
  templateUrl: './configuracion-negocio.component.html',
  styleUrl: './configuracion-negocio.component.css'
})
export class ConfiguracionNegocioComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  authService = inject(AuthService);

  countries: Country[] = [
    { code: 'UY', name: 'Uruguay',   flag: '🇺🇾', dial: '+598', phonePattern: /^09[1-9]\d{6}$/,   placeholder: '091 123 456',  example: '091123456'  },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', dial: '+54',  phonePattern: /^[1-9]\d{9}$/,     placeholder: '1123456789',   example: '1123456789' },
    { code: 'BR', name: 'Brasil',    flag: '🇧🇷', dial: '+55',  phonePattern: /^[1-9]{2}9\d{8}$/, placeholder: '11987654321',  example: '11987654321'},
    { code: 'CL', name: 'Chile',     flag: '🇨🇱', dial: '+56',  phonePattern: /^9\d{8}$/,         placeholder: '912345678',    example: '912345678'  },
    { code: 'PY', name: 'Paraguay',  flag: '🇵🇾', dial: '+595', phonePattern: /^9[6-9]\d{7}$/,    placeholder: '981234567',    example: '981234567'  },
    { code: 'ES', name: 'España',    flag: '🇪🇸', dial: '+34',  phonePattern: /^[6-7]\d{8}$/,     placeholder: '612345678',    example: '612345678'  },
    { code: 'MX', name: 'México',    flag: '🇲🇽', dial: '+52',  phonePattern: /^[1-9]\d{9}$/,     placeholder: '5512345678',   example: '5512345678' },
    { code: 'US', name: 'EE.UU.',    flag: '🇺🇸', dial: '+1',   phonePattern: /^\d{10}$/,         placeholder: '2025551234',   example: '2025551234' },
  ];

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
  logoUrl = signal('https://lh3.googleusercontent.com/aida-public/AB6AXuOfH70sCZ1NTvivT_s_4VuQEjDDu4tT0g6B_CKfUvPcletGI0BZvS65BeaHyfZb4Jpk4-0iuc1jE9LEfBZb0Ed4JXxWf9wbZoxDRmAb0oERXh089-gmX9cz8MoMcCVpxJm8UbyMQDp5C-lPB3TY_a8slPc5HUIz2yFg1eWALaegZrNWXvoWp7I9CLMbaWne_YQJaowtMmAugTybYeHyTF0dvkag-F8T5ZlF0Aty7tAYwxXWCd8eYDxcYWwk5puEZPUTNPQGVEcf8_o');
  bannerUrl = signal('https://lh3.googleusercontent.com/aida-public/AB6AXueNIFlTIxRcZ3YZvoFjtGgAcTDCg88O0I9Lg4envYZflnrJG9mJeXuHpLtfR_G13ZULX1gfDG91_KAp_icN7sPoEho0NPqjswuRaffxz5sK4fc4E_dzadqQ35zV_oosrVvDl2yk7kTUofZqsWvhKBOSAcxGuUwTyfDUkWhsfTGKLQQfgbO0Orr4YGyzHhbILSaG442EQUUJQKm1qHvd77DmKvC3GDFIzTjVyh50LWl8vSA3Pwc7yYQoCK4bp6akDmcynsnzw0ogdV');
  
  primaryColor = signal('#00685F');
  secondaryColor = signal('#5A5F62');
  accentColor = signal('#BAAD3E');

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  brandConfigKey = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.idUsuario) {
      this.brandConfigKey = `brand_config_${user.idUsuario}`;
      this.cargarDatosNegocio(user.idUsuario);
      this.cargarDatosUsuario(user.idUsuario);
    } else {
      this.errorMsg.set('No se pudo identificar al profesional actual.');
    }
  }

  cargarDatosNegocio(id: number) {
    this.http.get<any>(`http://localhost:8080/api/profesionales/${id}`).subscribe({
      next: (res) => {
        const prof = res.data;
        if (prof) {
          this.businessName.set(prof.nombreNegocio || '');
        }
      },
      error: () => {
        this.errorMsg.set('Error al cargar la información del negocio.');
      }
    });

    const saved = localStorage.getItem(this.brandConfigKey);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.logoUrl) this.logoUrl.set(config.logoUrl);
        if (config.bannerUrl) this.bannerUrl.set(config.bannerUrl);
        if (config.primaryColor) this.primaryColor.set(config.primaryColor);
        if (config.secondaryColor) this.secondaryColor.set(config.secondaryColor);
        if (config.accentColor) this.accentColor.set(config.accentColor);
      } catch (e) {
        console.error('Error parsing brand config', e);
      }
    }
  }

  cargarDatosUsuario(id: number) {
    this.http.get<any>(`http://localhost:8080/api/usuarios/${id}`).subscribe({
      next: (res) => {
        const user = res.data;
        if (!user) return;
        this.name.set(user.nombre);
        this.email.set(user.email);
        if (user.telefono) {
          const matchedCountry = this.countries.findIndex(c => user.telefono.startsWith(c.dial));
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
        this.errorMsg.set('Error al cargar la información del perfil del usuario.');
      }
    });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    // 1. Actualizar usuario (datos generales)
    this.http.put<any>(`http://localhost:8080/api/usuarios/${idProf}`, userPayload).pipe(
      switchMap((updateUserRes) => {
        // Subir foto de perfil de usuario si se seleccionó una
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('imagen', this.selectedFile);
          return this.http.post<any>(`http://localhost:8080/api/usuarios/${idProf}/imagen`, formData);
        }
        return of(updateUserRes);
      }),
      switchMap((profilePicRes) => {
        // Actualizar datos del profesional en localStorage / authService
        const updated = profilePicRes.data;
        if (updated) {
          const newProfile = {
            idUsuario: updated.idUsuario,
            name: updated.nombre,
            email: updated.email,
            picture: updated.imagenPerfilUrl || '',
            telefono: updated.telefono,
            type: this.authService.currentUser()?.type,
            imagenPerfilUrl: updated.imagenPerfilUrl,
            imagenPerfilPublicId: updated.imagenPerfilPublicId
          };
          this.authService.currentUser.set(newProfile);
          localStorage.setItem('user_session', JSON.stringify(newProfile));
        }

        // 2. Guardar nombre de negocio en el backend
        return this.http.put<any>(`http://localhost:8080/api/profesionales/${idProf}`, {
          nombreNegocio: this.businessName()
        });
      })
    ).subscribe({
      next: () => {
        // 3. Persistir diseño de marca localmente
        const visualConfig = {
          logoUrl: this.logoUrl(),
          bannerUrl: this.bannerUrl(),
          primaryColor: this.primaryColor(),
          secondaryColor: this.secondaryColor(),
          accentColor: this.accentColor()
        };
        localStorage.setItem(this.brandConfigKey, JSON.stringify(visualConfig));

        // Aplicar estilos dinámicos inmediatamente
        this.aplicarEstilosMarca(visualConfig);

        this.loading.set(false);
        this.successMsg.set('¡Configuración guardada correctamente!');
        setTimeout(() => {
          this.goBack();
        }, 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Error al guardar la configuración.');
      }
    });
  }

  aplicarEstilosMarca(config: any) {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
  }
}
