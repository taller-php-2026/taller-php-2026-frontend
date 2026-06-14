import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, NgIf],
  templateUrl: './app.html',
  standalone: true,
})
export class App implements OnInit {
  protected authService = inject(AuthService);
  protected readonly title = signal('taller-php-2026-frontend');

  constructor() {
    // Escuchar cambios del usuario para aplicar o remover estilos visuales del profesional
    effect(() => {
      const user = this.authService.currentUser();
      const type = this.authService.userType();
      
      if (user && type === 'profesional') {
        const backendColor = user.profesional?.color;
        if (backendColor) {
          this.aplicarEstilos({ primaryColor: backendColor });
          return;
        }
      }
      
      // Remover variables CSS si no es un profesional o no hay config
      this.removerEstilos();
    });
  }

  ngOnInit(): void {
    // Inicialización del componente principal
  }

  private aplicarEstilos(config: any): void {
    if (config.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(config.primaryColor)) {
      document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    }
  }

  private removerEstilos(): void {
    document.documentElement.style.removeProperty('--primary-color');
  }
}
