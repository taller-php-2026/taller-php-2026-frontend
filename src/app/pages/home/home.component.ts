import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '@shared/header/header.component';
import { HeroComponent } from './components/hero-home/hero.component';
import { LayoutComponent } from '@shared/layout/layout.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeaderComponent, HeroComponent, LayoutComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
