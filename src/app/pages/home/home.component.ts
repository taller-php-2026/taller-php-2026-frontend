import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from './components/hero-home/hero.component';
import { Layout } from '@shared/layout/layout.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroComponent, Layout],
  templateUrl: './home.component.html',
})

export class HomeComponent {}
