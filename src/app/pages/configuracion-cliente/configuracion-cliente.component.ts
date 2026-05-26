import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
  selector: 'app-configuracion-cliente',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './configuracion-cliente.component.html',
  styleUrl: './configuracion-cliente.component.css'
})
export class ConfiguracionClienteComponent {
  authService = inject(AuthService);
  private router = inject(Router);

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

  // Pre-load data from currentUser
  name = signal(this.authService.currentUser()?.name || 'Mariana Rodríguez');
  email = signal(this.authService.currentUser()?.email || 'mariana.rod@example.com');
  phone = signal('091123456');
  picture = signal(this.authService.currentUser()?.picture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBKFPIdwAwenLkQteMIQWDlbgG8uvhw5MMKIvA3_5bgEVxssOevl0oJGWDBLG0eYr65t0MRDoPYl2do2C6nINYsoFZpCxNlN0KLhl12DhYMXrK0WXLigcA1Sq5JCDDQ7FuSnp6T3iIHPNpQ1fyEXmhZmmfDpyEJMamYk1-3CwxRMG9hLcyllr9FeI1ZAjWAui9O26FbzB8lpqfUHP21I6ul-lioYyFOiQvzGEH_UpP92-x16wUUFUIhAdSRXr7HGKqwTnN1XrgWyuy');
  password = signal('••••••••••••');
  confirmPassword = signal('••••••••••••');

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  showConfirm = signal(false);

  goBack() {
    this.router.navigate(['/']);
  }

  toggleShowConfirm() {
    this.showConfirm.update(v => !v);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.picture.set(base64String);
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.authService.currentUser.set({
            ...currentUser,
            picture: base64String
          });
          localStorage.setItem('user_session', JSON.stringify(this.authService.currentUser()));
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    this.loading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    setTimeout(() => {
      // Mock saving logic
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.authService.currentUser.set({
          ...currentUser,
          name: this.name(),
          email: this.email(),
          picture: this.picture()
        });
        localStorage.setItem('user_session', JSON.stringify(this.authService.currentUser()));
      }
      this.loading.set(false);
      this.successMsg.set('¡Cambios guardados con éxito!');
    }, 1000);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
