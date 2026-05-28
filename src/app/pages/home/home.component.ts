import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '@shared/header/header.component';
import { HeroComponent } from './components/hero-home/hero.component';
import { Layout } from '@shared/layout/layout.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Header, HeroComponent, Layout],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
