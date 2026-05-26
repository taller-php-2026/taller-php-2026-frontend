import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [FormsModule, UpperCasePipe],
  templateUrl: './configuracion-negocio.component.html',
  styleUrl: './configuracion-negocio.component.css'
})
export class ConfiguracionNegocioComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  // Carga reactiva de los datos profesionales del mock
  private profesionalData = toSignal(this.http.get<any>('/mock-profesional.json'));

  businessName = signal('Cargando...');
  logoUrl = signal('https://lh3.googleusercontent.com/aida-public/AB6AXuAOfH70sCZ1NTvivT_s_4VuQEjDDu4tT0g6B_CKfUvPcletGI0BZvS65BeaHyfZb4Jpk4-0iuc1jE9LEfBZb0Ed4JXxWf9wbZoxDRmAb0oERXh089-gmX9cz8MoMcCVpxJm8UbyMQDp5C-lPB3TY_a8slPc5HUIz2yFg1eWALaegZrNWXvoWp7I9CLMbaWne_YQJaowtMmAugTybYeHyTF0dvkag-F8T5ZlF0Aty7tAYwxXWCd8eYDxcYWwk5puEZPUTNPQGVEcf8_o');
  bannerUrl = signal('https://lh3.googleusercontent.com/aida-public/AB6AXueNIFlTIxRcZ3YZvoFjtGgAcTDCg88O0I9Lg4envYZflnrJG9mJeXuHpLtfR_G13ZULX1gfDG91_KAp_icN7sPoEho0NPqjswuRaffxz5sK4fc4E_dzadqQ35zV_oosrVvDl2yk7kTUofZqsWvhKBOSAcxGuUwTyfDUkWhsfTGKLQQfgbO0Orr4YGyzHhbILSaG442EQUUJQKm1qHvd77DmKvC3GDFIzTjVyh50LWl8vSA3Pwc7yYQoCK4bp6akDmcynsnzw0ogdV');
  
  primaryColor = signal('#00685F');
  secondaryColor = signal('#5A5F62');
  accentColor = signal('#BAAD3E');

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  constructor() {
    // Sincronizar datos cargados del mock
    effect(() => {
      const data = this.profesionalData();
      if (data && data.profesional) {
        this.businessName.set(data.profesional.nombreNegocio || 'Sin Nombre');
        if (data.profesional.logoUrl) this.logoUrl.set(data.profesional.logoUrl);
        if (data.profesional.bannerUrl) this.bannerUrl.set(data.profesional.bannerUrl);
        if (data.profesional.primaryColor) this.primaryColor.set(data.profesional.primaryColor);
        if (data.profesional.secondaryColor) this.secondaryColor.set(data.profesional.secondaryColor);
        if (data.profesional.accentColor) this.accentColor.set(data.profesional.accentColor);
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

  goBack() {
    this.router.navigate(['/']);
  }

  saveChanges() {
    if (!this.businessName().trim()) {
      this.errorMsg.set('El nombre comercial es requerido.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('¡Configuración guardada correctamente!');
      setTimeout(() => {
        this.goBack();
      }, 1200);
    }, 1000);
  }
}
