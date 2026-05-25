import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-elegir-tipo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './elegir-tipo.component.html',
  styleUrl: './elegir-tipo.component.css'
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
    this.countries[+this.countryIndex].phonePattern.test(this.phone().replace(/\s/g, ''))
  );

  nombreNegocioValid = computed(() => this.nombreNegocio().trim().length >= 4);
  descripcionValid   = computed(() => this.descripcion().trim().length > 5);

  formValid = computed(() => {
    const base = this.phoneValid() && this.termsAccepted();
    return this.selectedRole === 'profesional'
      ? base && this.nombreNegocioValid() && this.descripcionValid()
      : base;
  });

  touch(field: 'phone' | 'nombreNegocio' | 'descripcion' | 'terms') {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  ngOnInit() {
    if (!this.auth.pendingUser() && !this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  completarRegistro() {
    this.touched.set({ phone: true, nombreNegocio: true, descripcion: true, terms: true });
    if (!this.formValid()) {
      this.errorMsg.set('Corrige los errores antes de continuar.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    setTimeout(() => {
      this.auth.setUserType(this.selectedRole);
      this.loading.set(false);
      this.router.navigate([this.selectedRole === 'cliente' ? '/home-cliente' : '/home-profesional']);
    }, 600);
  }
}
