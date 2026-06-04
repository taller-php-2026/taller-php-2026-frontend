import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { AuthService } from './services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, NgIf],
  templateUrl: './app.html',
})
export class App {
  protected authService = inject(AuthService);
  protected readonly title = signal('taller-php-2026-frontend');
}

